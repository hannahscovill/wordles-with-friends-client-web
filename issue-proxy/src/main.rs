use aws_sdk_ssm::Client as SsmClient;
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use lambda_http::{
    http::StatusCode, run, service_fn, Body, Error, Request, RequestPayloadExt, Response,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use tokio::sync::OnceCell;

// ── Cached secrets ─────────────────────────────────────────────────

struct Secrets {
    github_private_key: String,
    turnstile_secret_key: String,
}

static SECRETS: OnceCell<Secrets> = OnceCell::const_new();

async fn get_secrets(ssm: &SsmClient) -> Result<&'static Secrets, Error> {
    SECRETS
        .get_or_try_init(|| async {
            let private_key_param =
                std::env::var("GITHUB_PRIVATE_KEY_PARAM").unwrap_or_default();
            let turnstile_param =
                std::env::var("TURNSTILE_SECRET_KEY_PARAM").unwrap_or_default();

            // Check for direct env var first, then file, then SSM param (production)
            let github_private_key = std::env::var("GITHUB_PRIVATE_KEY")
                .ok()
                .filter(|s| !s.is_empty())
                .or_else(|| {
                    std::env::var("GITHUB_PRIVATE_KEY_FILE")
                        .ok()
                        .and_then(|path| std::fs::read_to_string(&path).ok())
                })
                .unwrap_or_default();

            let mut secrets = Secrets {
                github_private_key,
                turnstile_secret_key: std::env::var("TURNSTILE_SECRET_KEY").unwrap_or_default(),
            };

            // Only fetch from SSM if not already set via direct env var
            if secrets.github_private_key.is_empty() && !private_key_param.is_empty() {
                let resp = ssm
                    .get_parameter()
                    .name(&private_key_param)
                    .with_decryption(true)
                    .send()
                    .await?;
                secrets.github_private_key = resp
                    .parameter()
                    .and_then(|p| p.value())
                    .unwrap_or_default()
                    .to_string();
            }

            // Only fetch from SSM if not already set via direct env var
            if secrets.turnstile_secret_key.is_empty() && !turnstile_param.is_empty() {
                let resp = ssm
                    .get_parameter()
                    .name(&turnstile_param)
                    .with_decryption(true)
                    .send()
                    .await?;
                secrets.turnstile_secret_key = resp
                    .parameter()
                    .and_then(|p| p.value())
                    .unwrap_or_default()
                    .to_string();
            }

            Ok(secrets)
        })
        .await
}

// ── Request / Response types ────────────────────────────────────────

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct IssueRequest {
    issue_type: String,
    title: String,
    description: String,
    turnstile_token: String,
    #[serde(default)]
    website: String, // honeypot
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct IssueResponse {
    issue_number: u64,
    issue_url: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

// ── Turnstile verification ──────────────────────────────────────────

#[derive(Deserialize)]
struct TurnstileVerifyResponse {
    success: bool,
}

async fn verify_turnstile(token: &str, secret: &str, verify_url: &str) -> Result<bool, reqwest::Error> {
    let client = reqwest::Client::new();
    let resp = client
        .post(verify_url)
        .form(&[("secret", secret), ("response", token)])
        .send()
        .await?
        .json::<TurnstileVerifyResponse>()
        .await?;
    Ok(resp.success)
}

// ── GitHub App authentication ───────────────────────────────────────

#[derive(Serialize)]
struct JwtClaims {
    iat: u64,
    exp: u64,
    iss: String,
}

#[derive(Deserialize)]
struct InstallationTokenResponse {
    token: String,
}

async fn get_installation_token(
    app_id: &str,
    installation_id: &str,
    private_key: &str,
) -> Result<String, Error> {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let claims = JwtClaims {
        iat: now - 60, // 1 minute in the past to account for clock drift
        exp: now + 600, // 10 minutes
        iss: app_id.to_string(),
    };

    let header = Header::new(Algorithm::RS256);
    let key = EncodingKey::from_rsa_pem(private_key.as_bytes())
        .map_err(|e| Error::from(format!("Invalid private key: {}", e)))?;

    let jwt = encode(&header, &claims, &key)
        .map_err(|e| Error::from(format!("JWT encoding failed: {}", e)))?;

    let client = reqwest::Client::new();
    let resp = client
        .post(format!(
            "https://api.github.com/app/installations/{}/access_tokens",
            installation_id
        ))
        .header("Authorization", format!("Bearer {}", jwt))
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "wordles-issue-proxy/0.1")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status();
        let body = resp.text().await.unwrap_or_default();
        return Err(Error::from(format!(
            "Failed to get installation token: {} - {}",
            status, body
        )));
    }

    let token_resp: InstallationTokenResponse = resp.json().await?;
    Ok(token_resp.token)
}

// ── GitHub issue creation ───────────────────────────────────────────

#[derive(Serialize)]
struct GitHubCreateIssue {
    title: String,
    body: String,
    labels: Vec<String>,
}

#[derive(Deserialize)]
struct GitHubIssueResponse {
    number: u64,
    html_url: String,
}

// Issue templates (embedded at compile time from templates/*.md)
const TEMPLATE_BUG: &str = include_str!("../templates/bug.md");
const TEMPLATE_FEATURE: &str = include_str!("../templates/feature.md");
const TEMPLATE_QUESTION: &str = include_str!("../templates/question.md");
const TEMPLATE_FOOTER: &str = include_str!("../templates/footer.md");

struct IssueTemplate {
    title_prefix: String,
    label: String,
    body: String,
}

fn parse_template(raw: &str) -> IssueTemplate {
    let mut title_prefix = String::new();
    let mut label = String::new();
    let mut body = raw.to_string();

    // Parse YAML frontmatter (between --- delimiters)
    if raw.starts_with("---") {
        if let Some(end) = raw[3..].find("---") {
            let frontmatter = &raw[3..3 + end];
            body = raw[3 + end + 3..].trim_start().to_string();

            for line in frontmatter.lines() {
                if let Some((key, value)) = line.split_once(':') {
                    let value = value.trim().trim_matches('"');
                    match key.trim() {
                        "title_prefix" => title_prefix = value.to_string(),
                        "label" => label = value.to_string(),
                        _ => {}
                    }
                }
            }
        }
    }

    IssueTemplate { title_prefix, label, body }
}

fn get_template(issue_type: &str) -> IssueTemplate {
    let raw = match issue_type {
        "bug" => TEMPLATE_BUG,
        "feature" => TEMPLATE_FEATURE,
        _ => TEMPLATE_QUESTION,
    };
    parse_template(raw)
}

fn build_issue_body(issue_type: &str, description: &str) -> String {
    let template = get_template(issue_type);
    let body = template.body.replace("{description}", description);
    format!("{}{}", body.trim_end(), TEMPLATE_FOOTER)
}

fn issue_label(issue_type: &str) -> String {
    get_template(issue_type).label
}

fn issue_title_prefix(issue_type: &str) -> String {
    get_template(issue_type).title_prefix
}

// ── Rate limiting (in-memory, per Lambda instance) ──────────────────

struct RateLimiter {
    requests: Mutex<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    fn new() -> Self {
        Self {
            requests: Mutex::new(HashMap::new()),
        }
    }

    fn check(&self, ip: &str, max_requests: usize, window: Duration) -> bool {
        let mut map = self.requests.lock().unwrap();
        let now = Instant::now();
        let entries = map.entry(ip.to_string()).or_default();

        // Remove expired entries
        entries.retain(|t| now.duration_since(*t) < window);

        if entries.len() >= max_requests {
            return false;
        }

        entries.push(now);
        true
    }
}

// ── Lambda handler ──────────────────────────────────────────────────

fn json_response(status: StatusCode, body: impl Serialize) -> Response<Body> {
    Response::builder()
        .status(status)
        .header("Content-Type", "application/json")
        .body(Body::from(serde_json::to_string(&body).unwrap()))
        .unwrap()
}

async fn handler(
    event: Request,
    rate_limiter: &RateLimiter,
    ssm: &SsmClient,
) -> Result<Response<Body>, Error> {
    // Handle CORS preflight
    if event.method() == lambda_http::http::Method::OPTIONS {
        return Ok(Response::builder()
            .status(StatusCode::NO_CONTENT)
            .body(Body::Empty)?);
    }

    // Only accept POST
    if event.method() != lambda_http::http::Method::POST {
        return Ok(json_response(
            StatusCode::METHOD_NOT_ALLOWED,
            ErrorResponse {
                error: "Method not allowed".to_string(),
            },
        ));
    }

    // Rate limiting: 5 issues per IP per hour
    let source_ip = event
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .split(',')
        .next()
        .unwrap_or("unknown")
        .trim()
        .to_string();

    if !rate_limiter.check(&source_ip, 5, Duration::from_secs(3600)) {
        return Ok(json_response(
            StatusCode::TOO_MANY_REQUESTS,
            ErrorResponse {
                error: "Rate limit exceeded. Please try again later.".to_string(),
            },
        ));
    }

    // Parse request body
    let body: IssueRequest = match event.payload() {
        Ok(Some(b)) => b,
        _ => {
            return Ok(json_response(
                StatusCode::BAD_REQUEST,
                ErrorResponse {
                    error: "Invalid request body".to_string(),
                },
            ));
        }
    };

    // Validate required fields
    if body.title.trim().is_empty() || body.description.trim().is_empty() {
        return Ok(json_response(
            StatusCode::BAD_REQUEST,
            ErrorResponse {
                error: "Title and description are required".to_string(),
            },
        ));
    }

    // Honeypot check - if filled, silently succeed
    if !body.website.is_empty() {
        tracing::info!("Honeypot triggered from IP {}", source_ip);
        return Ok(json_response(
            StatusCode::OK,
            IssueResponse {
                issue_number: 0,
                issue_url: String::new(),
            },
        ));
    }

    // Load secrets from SSM
    let secrets = get_secrets(ssm).await?;

    // Verify Turnstile token
    let turnstile_verify_url = std::env::var("TURNSTILE_VERIFY_URL")
        .unwrap_or_else(|_| "https://challenges.cloudflare.com/turnstile/v0/siteverify".to_string());
    if !secrets.turnstile_secret_key.is_empty() {
        match verify_turnstile(&body.turnstile_token, &secrets.turnstile_secret_key, &turnstile_verify_url).await {
            Ok(true) => {}
            Ok(false) => {
                return Ok(json_response(
                    StatusCode::FORBIDDEN,
                    ErrorResponse {
                        error: "Turnstile verification failed".to_string(),
                    },
                ));
            }
            Err(e) => {
                tracing::error!("Turnstile verification error: {}", e);
                return Ok(json_response(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    ErrorResponse {
                        error: "Verification service error".to_string(),
                    },
                ));
            }
        }
    }

    // Get GitHub App credentials
    let github_app_id = std::env::var("GITHUB_APP_ID").unwrap_or_default();
    let github_installation_id = std::env::var("GITHUB_INSTALLATION_ID").unwrap_or_default();
    let github_repo = std::env::var("GITHUB_REPO")
        .unwrap_or_else(|_| "hannahscovill/wordles-with-friends-client-web".to_string());

    // Support both PAT (for local dev) and GitHub App (for production)
    let github_token = if let Ok(pat) = std::env::var("GITHUB_TOKEN") {
        pat
    } else if !github_app_id.is_empty()
        && !github_installation_id.is_empty()
        && !secrets.github_private_key.is_empty()
    {
        get_installation_token(&github_app_id, &github_installation_id, &secrets.github_private_key)
            .await?
    } else {
        tracing::error!("No GitHub credentials configured");
        return Ok(json_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            ErrorResponse {
                error: "Server configuration error".to_string(),
            },
        ));
    };

    let full_title = format!(
        "{}{}",
        issue_title_prefix(&body.issue_type),
        body.title
    );

    let create_issue = GitHubCreateIssue {
        title: full_title,
        body: build_issue_body(&body.issue_type, &body.description),
        labels: vec![issue_label(&body.issue_type).to_string()],
    };

    let client = reqwest::Client::new();
    let github_resp = client
        .post(format!(
            "https://api.github.com/repos/{}/issues",
            github_repo
        ))
        .header("Authorization", format!("Bearer {}", github_token))
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "wordles-issue-proxy/0.1")
        .header("X-GitHub-Api-Version", "2022-11-28")
        .json(&create_issue)
        .send()
        .await?;

    if !github_resp.status().is_success() {
        let status = github_resp.status();
        let body_text = github_resp.text().await.unwrap_or_default();
        tracing::error!("GitHub API error: {} - {}", status, body_text);
        return Ok(json_response(
            StatusCode::BAD_GATEWAY,
            ErrorResponse {
                error: "Failed to create issue".to_string(),
            },
        ));
    }

    let issue: GitHubIssueResponse = github_resp.json().await?;

    tracing::info!(
        "Created issue #{} from IP {}",
        issue.number,
        source_ip
    );

    Ok(json_response(
        StatusCode::CREATED,
        IssueResponse {
            issue_number: issue.number,
            issue_url: issue.html_url,
        },
    ))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .json()
        .without_time()
        .init();

    let rate_limiter = RateLimiter::new();

    // Initialize AWS SDK
    let config = aws_config::load_defaults(aws_config::BehaviorVersion::latest()).await;
    let ssm = SsmClient::new(&config);

    run(service_fn(|event: Request| async {
        handler(event, &rate_limiter, &ssm).await
    }))
    .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bug_template_has_required_fields() {
        let template = get_template("bug");
        assert!(!template.title_prefix.is_empty(), "bug template missing title_prefix");
        assert!(!template.label.is_empty(), "bug template missing label");
        assert!(template.body.contains("{description}"), "bug template missing {{description}} placeholder");
    }

    #[test]
    fn feature_template_has_required_fields() {
        let template = get_template("feature");
        assert!(!template.title_prefix.is_empty(), "feature template missing title_prefix");
        assert!(!template.label.is_empty(), "feature template missing label");
        assert!(template.body.contains("{description}"), "feature template missing {{description}} placeholder");
    }

    #[test]
    fn question_template_has_required_fields() {
        let template = get_template("question");
        assert!(!template.title_prefix.is_empty(), "question template missing title_prefix");
        assert!(!template.label.is_empty(), "question template missing label");
        assert!(template.body.contains("{description}"), "question template missing {{description}} placeholder");
    }

    #[test]
    fn build_issue_body_replaces_description() {
        let body = build_issue_body("bug", "Test description here");
        assert!(body.contains("Test description here"), "description not inserted into body");
        assert!(!body.contains("{description}"), "placeholder not replaced");
    }

    #[test]
    fn build_issue_body_includes_footer() {
        let body = build_issue_body("bug", "Test");
        assert!(body.contains("Submitted anonymously"), "footer not appended");
    }

    #[test]
    fn parse_template_handles_frontmatter() {
        let raw = "---\ntitle_prefix: \"[Test] \"\nlabel: test-label\n---\n\nBody content";
        let template = parse_template(raw);
        assert_eq!(template.title_prefix, "[Test] ");
        assert_eq!(template.label, "test-label");
        assert_eq!(template.body, "Body content");
    }

    #[test]
    fn parse_template_handles_missing_frontmatter() {
        let raw = "Just a body without frontmatter";
        let template = parse_template(raw);
        assert!(template.title_prefix.is_empty());
        assert!(template.label.is_empty());
        assert_eq!(template.body, raw);
    }
}
