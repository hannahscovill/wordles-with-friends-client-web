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
  adapter: 'fetch',
  withCredentials: true,
});

// Convert non-2xx responses into ApiError
apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  if (error.response) {
    const body: string =
      typeof error.response.data === 'string'
        ? error.response.data
        : JSON.stringify(error.response.data);

    throw new ApiError(
      `Request failed: ${error.response.status}`,
      error.response.status,
      body,
    );
  }
  throw error;
});

export function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
