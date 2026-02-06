import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { reportError } from '../lib/telemetry';
import { ApiError } from './errors';

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

// Convert non-2xx responses into ApiError
apiClient.interceptors.response.use(undefined, (error: AxiosError) => {
  // Check for response data - indicates server responded with an error status
  if (error.response) {
    const body: string =
      typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data);

    return Promise.reject(
      new ApiError(
        `Request failed: ${error.response.status}`,
        error.response.status,
        body,
      ),
    );
  }
  return Promise.reject(error);
});

export function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
