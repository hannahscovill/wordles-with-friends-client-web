# Wordles with Friends

A multiplayer Wordle game built with React + Rsbuild.

## Development

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build → dist/
npm run test       # unit tests (rstest)
npm run test:e2e   # e2e tests (Playwright)
npm run storybook  # component dev at http://localhost:6006
```

## Infrastructure

CDK stacks for the frontend deployment.

| Stack                           | Purpose                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| `WordlesWithFriendsStack`       | S3 bucket, CloudFront distribution, ACM certificate for `wordles.dev` |
| `WordlesGitHubActionsRoleStack` | IAM role for GitHub Actions CI/CD                                     |

The main stack deploys to **us-east-1** (required for CloudFront ACM certificates). The role stack deploys to us-west-2.

### GitHub Actions Role

The role stack imports `GitHubOidcProviderArn` from [shared-infrastructure](https://github.com/hannahscovill/shared-infrastructure). The shared OIDC provider must be deployed first.

Permissions include: S3, CloudFront, ACM, Lambda (CDK BucketDeployment), IAM, and CloudFormation.

### Deploying

```bash
cd infra
npm install

# GitHub Actions role (once, or when permissions change)
npx cdk deploy WordlesGitHubActionsRoleStack

# Main application
npx cdk deploy WordlesWithFriendsStack
```

## Local Observability

A full local observability stack for testing the frontend error pipeline end-to-end, without needing Grafana Cloud. Traces flow from the browser through an OpenTelemetry Collector into Grafana Tempo, and you can query them in a local Grafana instance.

### Architecture

```
Browser (localhost:3000)
    │
    │  POST /v1/traces (same-origin)
    ▼
Nginx (app container)  ──  serves static assets + proxies traces
    │
    │  proxy_pass to otel-collector:4318
    ▼
OTel Collector
    │
    │  OTLP HTTP forward
    ▼
Grafana Tempo (tempo:4318)  ──  stores traces locally
    │
    │  query via Tempo datasource
    ▼
Grafana UI (localhost:3001)
```

The app is containerized and served by nginx, which also reverse-proxies `/v1/traces` to the OTel Collector. This avoids CORS issues entirely since the browser sends traces to the same origin it loaded the page from.

Three error sources feed into this pipeline:

- **React ErrorBoundary** (`error.source: error-boundary`) - catches component render errors
- **window.onerror** (`error.source: window.onerror`) - catches uncaught exceptions
- **unhandledrejection** (`error.source: unhandledrejection`) - catches unhandled promise rejections

### Quick Start

```bash
# 1. Start everything (builds the app + starts observability stack)
docker compose -f observability/docker-compose.yml up -d --build

# 2. Open the app and click around
open http://localhost:3000

# 3. Open Grafana and view traces
open http://localhost:3001
# Navigate to Explore > Tempo to see traces from the app
```

To stop the stack:

```bash
docker compose -f observability/docker-compose.yml down       # keep data
docker compose -f observability/docker-compose.yml down -v    # wipe data
```

### Verifying Traces with curl

You don't need the app running to test the pipeline. Send a trace directly to the collector:

```bash
TRACE_ID=$(python3 -c "import secrets; print(secrets.token_hex(16))")
SPAN_ID=$(python3 -c "import secrets; print(secrets.token_hex(8))")
NOW_NS=$(python3 -c "import time; print(int(time.time() * 1e9))")
END_NS=$(python3 -c "import time; print(int((time.time() + 0.5) * 1e9))")

curl -X POST http://localhost:3000/v1/traces \
  -H 'Content-Type: application/json' \
  -d "{
    \"resourceSpans\": [{
      \"resource\": {
        \"attributes\": [
          { \"key\": \"service.name\", \"value\": { \"stringValue\": \"wordles-frontend\" } }
        ]
      },
      \"scopeSpans\": [{
        \"scope\": { \"name\": \"wordles-frontend\" },
        \"spans\": [{
          \"traceId\": \"${TRACE_ID}\",
          \"spanId\": \"${SPAN_ID}\",
          \"name\": \"error\",
          \"kind\": 1,
          \"startTimeUnixNano\": \"${NOW_NS}\",
          \"endTimeUnixNano\": \"${END_NS}\",
          \"status\": { \"code\": 2, \"message\": \"Test error\" },
          \"attributes\": [
            { \"key\": \"error.source\", \"value\": { \"stringValue\": \"cli-test\" } }
          ]
        }]
      }]
    }]
  }"
```

Then query it back through the Grafana API:

```bash
# Search for recent traces
curl -s "http://localhost:3001/api/datasources/proxy/1/api/search?tags=service.name%3Dwordles-frontend&limit=5" | python3 -m json.tool

# Fetch a specific trace by ID
curl -s "http://localhost:3001/api/datasources/proxy/1/api/traces/${TRACE_ID}" | python3 -m json.tool
```

### Pitfalls

This stack looks simple but there are a few sharp edges worth knowing about:

**Tempo's OTLP receiver binds to localhost by default (v2.7+)**

Tempo's `distributor.receivers.otlp.protocols.http` receiver defaults to `localhost:4318`, not `0.0.0.0:4318`. In Docker, that means the receiver is only reachable from inside the Tempo container itself. Other containers (like the OTel Collector) get connection refused. The fix is explicit:

```yaml
# tempo-config.yaml
distributor:
  receivers:
    otlp:
      protocols:
        http:
          endpoint: 0.0.0.0:4318 # without this, other containers can't reach Tempo
```

**Tempo's API port (3200) is not the ingestion port (4318)**

Port 3200 is for querying traces and health checks. Port 4318 is the OTLP HTTP receiver for ingesting traces. Sending traces to `http://tempo:3200/v1/traces` returns a 404. The collector must export to port 4318.

**Tempo latest (v2.10+) requires Kafka for the write path**

Tempo v2.10 moved to a Kafka-based ingestion architecture. Running it without Kafka causes `"DoBatch: InstancesCount <= 0"` errors because the ingester ring never forms. For a simple local setup, pin to **v2.6.1** which supports the straightforward ingester-based write path out of the box.

**Tempo needs an `ingester` config section for single-binary mode**

Without the `ingester` block in `tempo-config.yaml`, the ingester won't register in the distributor ring and all trace pushes fail with 503. The minimum config for local use:

```yaml
ingester:
  trace_idle_period: 10s
  max_block_bytes: 1_000_000
  max_block_duration: 5m
```

**Trace IDs must be exactly 32 hex characters, span IDs exactly 16**

When crafting test traces with curl, if the IDs are the wrong length, Tempo returns a 400 with a cryptic `"ID.UnmarshalJSONIter: length mismatch"` error. Use `secrets.token_hex(16)` for trace IDs and `secrets.token_hex(8)` for span IDs.

**CORS blocks browser-to-collector requests**

The OTel SDK sends traces via `fetch()` with `credentials: 'include'`. When the collector is on a different port, CORS kicks in. The collector's `allowed_origins: ['*']` won't work because `Access-Control-Allow-Origin: *` is forbidden with credentials. Specific origins like `http://localhost:3000` also failed to match in our collector version. The fix: proxy `/v1/traces` through the same nginx that serves the app, making it a same-origin request that bypasses CORS entirely.

### Files

| File                                       | Purpose                                                            |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `observability/docker-compose.yml`         | All four services: app, OTel Collector, Tempo, Grafana             |
| `observability/Dockerfile`                 | Multi-stage build: node build → nginx serve with OTel proxy        |
| `observability/nginx.conf`                 | Serves SPA, proxies `/v1/traces` to collector (avoids CORS)        |
| `observability/otel-collector-config.yaml` | Collector receives OTLP on :4318, exports to Tempo + debug log     |
| `observability/tempo-config.yaml`          | Tempo trace storage config for single-binary local mode            |
| `observability/grafana/datasources.yaml`   | Auto-provisions Tempo as the default Grafana datasource            |
| `.dockerignore`                            | Excludes node_modules, dist, infra, .git from Docker build context |
| `src/lib/telemetry.ts`                     | OTel SDK init, fetch instrumentation, `reportError()` helper       |
| `src/components/ErrorBoundary.tsx`         | React error boundary that calls `reportError()` on catch           |

## CI/CD

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`). Triggered on push to `main`.

| Variable            | Description                          |
| ------------------- | ------------------------------------ |
| `AWS_ACCOUNT_ID`    | AWS account ID                       |
| `AWS_REGION`        | AWS region (e.g., `us-west-2`)       |
| `AWS_OIDC_ROLE_ARN` | IAM role ARN for OIDC authentication |
