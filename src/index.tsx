import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { AuthProvider } from './AuthProvider';

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

const rootEl: HTMLElement | null = document.getElementById('root');
if (rootEl) {
  const root: ReactDOM.Root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience,
        }}
      >
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </Auth0Provider>
    </React.StrictMode>,
  );
}
