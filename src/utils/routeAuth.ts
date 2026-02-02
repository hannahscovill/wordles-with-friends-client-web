import type { Auth0ContextInterface } from '@auth0/auth0-react';
import { redirect } from '@tanstack/react-router';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

/**
 * Check if user has stored auth tokens in localStorage.
 * This is used to show optimistic UI while Auth0 validates.
 */
export function hasStoredAuthTokens(): boolean {
  try {
    const stored: string | null = localStorage.getItem('auth_tokens');
    if (!stored) return false;
    const tokens: AuthTokens = JSON.parse(stored) as AuthTokens;
    return tokens.access_token !== '';
  } catch {
    return false;
  }
}

/**
 * Require authentication for a route.
 * Call this in beforeLoad to protect a route.
 *
 * @param auth - Auth0 context from router context
 * @param returnTo - Path to return to after login
 * @throws Redirect to login if not authenticated
 */
export function requireAuth(
  auth: Auth0ContextInterface,
  returnTo: string,
): void {
  const hasStoredTokens: boolean = hasStoredAuthTokens();

  // If no stored tokens and not authenticated, redirect immediately
  if (!hasStoredTokens && !auth.isAuthenticated) {
    auth.loginWithRedirect({
      appState: { returnTo },
    });
    // Throw redirect to prevent route from rendering
    throw redirect({ to: '/' });
  }

  // If Auth0 finished loading and not authenticated, redirect
  if (!auth.isLoading && !auth.isAuthenticated) {
    auth.loginWithRedirect({
      appState: { returnTo },
    });
    throw redirect({ to: '/' });
  }
}

/**
 * Check if user is authenticated (or has stored tokens while Auth0 loads).
 * Use this for conditional rendering, not for protecting routes.
 */
export function isEffectivelyAuthenticated(
  auth: Auth0ContextInterface,
): boolean {
  const hasStoredTokens: boolean = hasStoredAuthTokens();
  return auth.isAuthenticated || (auth.isLoading && hasStoredTokens);
}
