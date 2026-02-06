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

/** Convert an AxiosError with response to ScorekeeperApiError */
export function toScorekeeperApiError(
  error: AxiosError,
): ScorekeeperApiError | null {
  if (!error.response) {
    return null;
  }

  const statusCode: number = error.response.status;
  const fallback: string = `Request failed with status ${statusCode}`;
  const userMessage: string = parseApiErrorMessage(
    error.response.data,
    fallback,
  );

  return new ScorekeeperApiError(statusCode, userMessage);
}

/**
 * Parse the response body from the API and extract a user-friendly message.
 * Supports multiple response formats:
 * - { error: { message: "..." } }
 * - { error: "..." }
 * - { message: "..." }
 * - { detail: "..." }
 */
export function parseApiErrorMessage(
  responseBody: unknown,
  fallback: string,
): string {
  if (responseBody === null || responseBody === undefined) {
    return fallback;
  }

  // If it's a string, try to parse as JSON
  if (typeof responseBody === 'string') {
    const stringBody: string = responseBody;
    if (stringBody.length === 0) {
      return fallback;
    }
    try {
      const parsed: unknown = JSON.parse(stringBody);
      if (typeof parsed === 'object' && parsed !== null) {
        responseBody = parsed;
      } else {
        return stringBody.length < 500 ? stringBody : fallback;
      }
    } catch {
      // Not JSON - use as-is if short enough
      return stringBody.length < 500 ? stringBody : fallback;
    }
  }

  if (typeof responseBody !== 'object') {
    return fallback;
  }

  const body: Record<string, unknown> = responseBody as Record<string, unknown>;

  // { error: "message" }
  if (typeof body.error === 'string') {
    return body.error;
  }

  // { error: { message: "message" } }
  if (
    body.error !== null &&
    typeof body.error === 'object' &&
    typeof (body.error as Record<string, unknown>).message === 'string'
  ) {
    return (body.error as Record<string, unknown>).message as string;
  }

  // { message: "message" }
  if (typeof body.message === 'string') {
    return body.message;
  }

  // { detail: "message" }
  if (typeof body.detail === 'string') {
    return body.detail;
  }

  return fallback;
}
