import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Auth0Provider,
  useAuth0,
  type Auth0ContextInterface,
} from '@auth0/auth0-react';
import { PostHogProvider } from 'posthog-js/react';
import type { PostHogConfig } from 'posthog-js';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { AuthProvider } from './AuthProvider';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { initTelemetry } from './lib/telemetry';
import { ErrorBoundary } from './components/ErrorBoundary';

// Initialize OpenTelemetry BEFORE React renders (PostHog is handled by PostHogProvider)
initTelemetry();

/** Dev-only: throws during render when ?error=1 is in the URL, for testing the ErrorBoundary. */
function ErrorTrigger(): null {
  if (new URLSearchParams(window.location.search).has('error')) {
    throw new Error('Intentional error triggered via ?error query param');
  }
  return null;
}

export function App(): React.ReactElement {
  const auth: Auth0ContextInterface = useAuth0();
  return (
    <>
      <ErrorTrigger />
      <RouterProvider router={router} context={{ auth }} />
    </>
  );
}

const domain: string | undefined = import.meta.env.PUBLIC_AUTH0_DOMAIN;
const clientId: string | undefined = import.meta.env.PUBLIC_AUTH0_CLIENT_ID;
const audience: string | undefined = import.meta.env.PUBLIC_AUTH0_AUDIENCE;

if (!domain || !clientId || !audience) {
  console.error('Auth0 configuration missing. Please check your .env file.');
  console.error('Required environment variables:');
  console.error('- PUBLIC_AUTH0_DOMAIN');
  console.error('- PUBLIC_AUTH0_CLIENT_ID');
  console.error('- PUBLIC_AUTH0_AUDIENCE');
  throw new Error(
    'Auth0 domain, client ID, and audience must be set in .env file',
  );
}

const posthogKey: string | undefined = import.meta.env.PUBLIC_POSTHOG_KEY;
const posthogOptions: Partial<PostHogConfig> = {
  api_host: import.meta.env.PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  defaults: '2025-11-30',
};

const rootEl: HTMLElement | null = document.getElementById('root');
if (rootEl) {
  const root: ReactDOM.Root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <PostHogProvider apiKey={posthogKey ?? ''} options={posthogOptions}>
          <Auth0Provider
            domain={domain}
            clientId={clientId}
            cacheLocation="localstorage"
            authorizationParams={{
              redirect_uri: window.location.origin,
              scope: 'openid profile email read:current_user',
              audience,
            }}
          >
            <AuthProvider>
              <UserProfileProvider>
                <App />
              </UserProfileProvider>
            </AuthProvider>
          </Auth0Provider>
        </PostHogProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
