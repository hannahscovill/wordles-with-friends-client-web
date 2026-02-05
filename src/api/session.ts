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
  // Set cookie to expire in 1 year
  const expires: Date = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
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
