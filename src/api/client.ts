import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import {
  trace,
  SpanStatusCode,
  type Tracer,
  type Span,
} from '@opentelemetry/api';
import { reportError, truncate, MAX_ATTR_LENGTH } from '../lib/telemetry';

const API_BASE_URL: string = import.meta.env.PUBLIC_API_URL as string;

if (!API_BASE_URL) {
  const error: Error = new Error(
    'PUBLIC_API_URL is not set. Configure it in .env or .env.local.',
  );
  reportError(error, {
    'error.source': 'api.client',
    'error.severity': 'critical',
  });
  throw error;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Set withCredentials conditionally based on whether we're using token auth.
// Global withCredentials: true forces strict CORS for all requests, which can
// cause the browser to block error responses if the server's CORS headers
// don't fully support credentials mode.
apiClient.interceptors.request.use((config) => {
  // Only send cookies when NOT using token-based auth
  const hasAuthHeader: boolean = Boolean(config.headers?.Authorization);
  config.withCredentials = !hasAuthHeader;
  return config;
});

// Capture request/response bodies and headers as a trace span for API calls.
// Wrapped in try-catch so telemetry failures never mask the real error.
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    try {
      recordApiSpan(response);
    } catch {
      /* telemetry must not break app */
    }
    return response;
  },
  (error) => {
    try {
      if (error.response) recordApiSpan(error.response, error);
    } catch {
      /* telemetry must not break app */
    }
    return Promise.reject(error);
  },
);

// Map API endpoints to SDK function names for readable span names
const SPAN_NAMES: [string, RegExp, string][] = [
  ['POST', /^\/guess$/, 'submitGuess'],
  ['GET', /^\/game\//, 'getGameProgress'],
  ['GET', /^\/history$/, 'getHistory'],
  ['GET', /^\/profile$/, 'getUserProfile'],
  ['PUT', /^\/profile$/, 'updateUserProfile'],
  ['POST', /^\/profile\/avatar$/, 'uploadAvatar'],
  ['GET', /^\/puzzles$/, 'getPuzzles'],
  ['PUT', /^\/puzzles$/, 'setPuzzle'],
];

function getSpanName(method: string, path: string): string {
  for (const [m, pattern, name] of SPAN_NAMES) {
    if (method === m && pattern.test(path)) return `scorekeeper.${name}`;
  }
  return `scorekeeper.${method} ${path}`;
}

function recordApiSpan(response: AxiosResponse, error?: Error): void {
  const method: string = response.config.method?.toUpperCase() ?? 'UNKNOWN';
  const path: string = response.config.url ?? '/';
  const tracer: Tracer = trace.getTracer('wordles-frontend');
  const span: Span = tracer.startSpan(getSpanName(method, path));

  span.setAttributes({
    'http.method': method,
    'http.url': `${response.config.baseURL ?? ''}${path}`,
    'http.status_code': response.status,
  });

  if (response.config.data) {
    span.setAttribute(
      'http.request.body',
      truncate(
        typeof response.config.data === 'string'
          ? response.config.data
          : JSON.stringify(response.config.data),
        MAX_ATTR_LENGTH,
      ),
    );
  }

  if (response.config.headers) {
    const headers: Record<string, unknown> = {
      ...response.config.headers,
    };
    if (headers['Authorization']) {
      headers['Authorization'] = '[REDACTED]';
    }
    span.setAttribute(
      'http.request.headers',
      truncate(JSON.stringify(headers), MAX_ATTR_LENGTH),
    );
  }

  if (response.data !== undefined) {
    span.setAttribute(
      'http.response.body',
      truncate(
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data),
        MAX_ATTR_LENGTH,
      ),
    );
  }

  if (response.headers) {
    span.setAttribute(
      'http.response.headers',
      truncate(JSON.stringify(response.headers), MAX_ATTR_LENGTH),
    );
  }

  if (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.recordException(error);
  }

  span.end();
}

export function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
