const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8080';

const SESSION_COOKIE_NAME: string = 'wordle_session';

function generateSessionId(): string {
  return crypto.randomUUID();
}

function getSessionCookie(): string | null {
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

function ensureSessionCookie(): string {
  let sessionId: string | null = getSessionCookie();
  if (!sessionId) {
    sessionId = generateSessionId();
    setSessionCookie(sessionId);
  }
  return sessionId;
}

export interface GuessRequest {
  puzzle_date_iso_day: string;
  word_guessed: string;
}

export type LetterGrade = 'correct' | 'contained' | 'wrong';

export interface GradedLetter {
  letter: string;
  grade: LetterGrade;
}

export type GradedMove = GradedLetter[];

export interface GameState {
  game_id: string;
  user_id: string;
  moves_qty: number;
  won: boolean;
  moves: GradedMove[];
}

export interface SubmitGuessOptions {
  token?: string;
}

export const submitGuess = async (
  data: GuessRequest,
  options: SubmitGuessOptions = {},
): Promise<GameState> => {
  const { token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Ensure anonymous users have a session cookie
    ensureSessionCookie();
  }

  const response: Response = await fetch(`${API_BASE_URL}/guess`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage: string = `Failed to submit guess: ${response.status}`;
    try {
      const errorBody: {
        error?: { code?: string; message?: string } | string;
      } = (await response.json()) as {
        error?: { code?: string; message?: string } | string;
      };
      if (errorBody.error) {
        if (typeof errorBody.error === 'string') {
          errorMessage = errorBody.error;
        } else if (errorBody.error.message) {
          errorMessage = errorBody.error.message;
        }
      }
    } catch {
      // If we can't parse the response body, use the default message
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as GameState;
};

export interface GetGameProgressOptions {
  token?: string;
}

export const getGameProgress = async (
  puzzleDateIsoDay: string,
  options: GetGameProgressOptions = {},
): Promise<GameState | null> => {
  const { token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Check if there's a session cookie for anonymous users
    const sessionId: string | null = getSessionCookie();
    if (!sessionId) {
      // No session cookie means no saved progress
      return null;
    }
  }

  const response: Response = await fetch(
    `${API_BASE_URL}/game/${puzzleDateIsoDay}`,
    {
      method: 'GET',
      headers,
      credentials: 'include',
    },
  );

  if (response.status === 404) {
    // No game found for this date
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to get game progress: ${response.status}`);
  }

  return (await response.json()) as GameState;
};
