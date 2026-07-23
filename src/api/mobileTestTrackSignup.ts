import type { AxiosResponse } from 'axios';
import { apiClient, authHeaders } from './client';
import {
  ScorekeeperApiError,
  isAxiosError,
  toScorekeeperApiError,
} from './errors';

// ── Types ───────────────────────────────────────────────────────────

/** Where the signup form is being rendered, for analytics attribution only. */
export type MobileTestTrackSignupSource =
  | 'game_status_modal'
  | 'whats_new_page';

export interface MobileTestTrackPlatforms {
  ios?: boolean;
  android?: boolean;
}

export interface AnonymousMobileTestTrackSignupRequest extends MobileTestTrackPlatforms {
  email: string;
  turnstileToken: string;
  /** Honeypot field — should always be empty for real users */
  website?: string;
}

export interface MobileTestTrackSignupResponse {
  mobileTestTrackOptInIos: boolean;
  mobileTestTrackOptInAndroid: boolean;
}

// ── Client ──────────────────────────────────────────────────────────

const handleError = (e: unknown): never => {
  if (isAxiosError(e)) {
    const apiError: ScorekeeperApiError | null = toScorekeeperApiError(e);
    if (apiError) {
      throw new Error(apiError.userMessage);
    }
  }
  throw new Error('Network error');
};

/**
 * Opts the authenticated user into the iOS and/or Android test track.
 * No email or Turnstile token needed — the JWT already proves the request
 * is from a real logged-in user.
 */
export const submitAuthenticatedMobileTestTrackSignup = async (
  platforms: MobileTestTrackPlatforms,
  token: string,
): Promise<MobileTestTrackSignupResponse> => {
  try {
    const response: AxiosResponse<MobileTestTrackSignupResponse> =
      await apiClient.post<MobileTestTrackSignupResponse>(
        '/profile/mobile-test-track-signup',
        platforms,
        { headers: authHeaders(token) },
      );
    return response.data;
  } catch (e: unknown) {
    return handleError(e);
  }
};

/**
 * Opts an anonymous visitor into the iOS and/or Android test track by
 * email. Public and unauthenticated; gated by Turnstile CAPTCHA.
 */
export const submitAnonymousMobileTestTrackSignup = async (
  data: AnonymousMobileTestTrackSignupRequest,
): Promise<MobileTestTrackSignupResponse> => {
  try {
    const response: AxiosResponse<MobileTestTrackSignupResponse> =
      await apiClient.post<MobileTestTrackSignupResponse>(
        '/mobile-test-track-signup',
        data,
      );
    return response.data;
  } catch (e: unknown) {
    return handleError(e);
  }
};
