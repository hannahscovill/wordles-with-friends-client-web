import type { AxiosError } from 'axios';

/**
 * Error thrown when the Scorekeeper API returns an error response.
 * This means the server was reachable and responded with an error status.
 */
export class ScorekeeperApiError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
  ) {
    super(userMessage);
    this.name = 'ScorekeeperApiError';
  }
}

/** Check if an error is an AxiosError (has isAxiosError flag) */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/** Convert a 4xx AxiosError to ScorekeeperApiError. Returns null for 5xx or network errors. */
export function toScorekeeperApiError(
  error: AxiosError,
): ScorekeeperApiError | null {
  if (!error.response) {
    return null;
  }

  const statusCode: number = error.response.status;

  // Only wrap 4xx client errors - 5xx server errors should bubble up
  if (statusCode < 400 || statusCode >= 500) {
    return null;
  }

  const fallback: string = `Request failed with status ${statusCode}`;
  const userMessage: string = parseApiErrorMessage(
    error.response.data,
    fallback,
  );

  return new ScorekeeperApiError(statusCode, userMessage);
}

/**
 * Parse the response body from the Scorekeeper API and extract the user message.
 * Expects format: { error: { message: "..." } }
 */
export function parseApiErrorMessage(
  responseBody: unknown,
  fallback: string,
): string {
  if (
    responseBody !== null &&
    typeof responseBody === 'object' &&
    'error' in responseBody
  ) {
    const body: { error: unknown } = responseBody as { error: unknown };
    if (
      body.error !== null &&
      typeof body.error === 'object' &&
      'message' in body.error &&
      typeof (body.error as { message: unknown }).message === 'string'
    ) {
      return (body.error as { message: string }).message;
    }
  }

  return fallback;
}
