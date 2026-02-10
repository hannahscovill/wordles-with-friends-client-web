const SESSION_COOKIE_NAME: string = 'wordle_session';

function generateSessionId(): string {
  return crypto.randomUUID();
}

export function getSessionCookie(): string | null {
  const match: RegExpMatchArray | null = document.cookie.match(
    new RegExp(`(^| )${SESSION_COOKIE_NAME}=([^;]+)`),
  );
  return match ? match[2] : null;
}

function setSessionCookie(sessionId: string): void {
  // Set cookie to expire in 7 days (matches DynamoDB TTL for anonymous records)
  const expires: Date = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  // Use SameSite=None; Secure for cross-origin API requests, and Domain for subdomain access
  const isSecure: boolean = window.location.protocol === 'https:';
  const sameSite: string = isSecure ? 'None' : 'Lax';
  const secure: string = isSecure ? '; Secure' : '';
  // Set domain to allow cookie to be sent to api.wordles.dev subdomain
  const domain: string = window.location.hostname.includes('wordles.dev')
    ? '; Domain=.wordles.dev'
    : '';
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; expires=${expires.toUTCString()}; path=/${domain}; SameSite=${sameSite}${secure}`;
}

export function ensureSessionCookie(): string {
  let sessionId: string | null = getSessionCookie();
  if (!sessionId) {
    sessionId = generateSessionId();
    setSessionCookie(sessionId);
  }
  return sessionId;
}

export function clearSessionCookie(): void {
  const domain: string = window.location.hostname.includes('wordles.dev')
    ? '; Domain=.wordles.dev'
    : '';
  document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
}
