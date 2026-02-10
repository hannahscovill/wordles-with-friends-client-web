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
import { SessionConversionProvider } from './contexts/SessionConversionContext';
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

const domain: string = import.meta.env.PUBLIC_AUTH0_DOMAIN;
const clientId: string = import.meta.env.PUBLIC_AUTH0_CLIENT_ID;
const audience: string = import.meta.env.PUBLIC_AUTH0_AUDIENCE;
const posthogKey: string = import.meta.env.PUBLIC_POSTHOG_KEY;

// https://posthog.com/docs/libraries/js/config
const posthogOptions: Partial<PostHogConfig> = {
  // Endpoint where events are sent (e.g. US or EU cloud).
  api_host: import.meta.env.PUBLIC_POSTHOG_HOST,
  // Date-based versioning that opts into all default behavior changes up to this
  // date. '2026-01-30' enables: history-change pageview capture, strict minimum
  // session recording duration, content-aware rage-click detection, and <head>
  // script injection.
  defaults: '2026-01-30',
  // Pre-populate SDK state before it finishes initializing (feature flags, etc.).
  // distinctID: undefined lets PostHog generate an anonymous ID.
  // TODO: once pairwise identifiers are set up, call posthog.identify(pairwiseId)
  // after Auth0 resolves to link anonymous events to the identified user.
  bootstrap: {
    distinctID: undefined,
  },
  // Callback fired once the SDK has fully initialized.
  loaded: (ph) => {
    ph.register({ environment: import.meta.env.PUBLIC_ENVIRONMENT_NAME });
  },
};

const rootEl: HTMLElement | null = document.getElementById('root');
if (rootEl) {
  const root: ReactDOM.Root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <PostHogProvider apiKey={posthogKey} options={posthogOptions}>
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
              <SessionConversionProvider>
                <UserProfileProvider>
                  <App />
                </UserProfileProvider>
              </SessionConversionProvider>
            </AuthProvider>
          </Auth0Provider>
        </PostHogProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
