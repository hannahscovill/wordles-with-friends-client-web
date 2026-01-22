import type { ReactElement } from 'react';
import { createRoute, redirect, type AnyRoute } from '@tanstack/react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { rootRoute } from './__root';

// eslint-disable-next-line react-refresh/only-export-components
const ProfileComponent = (): ReactElement => {
  const { user } = useAuth0();

  if (!user) {
    return <p className="app__greeting">Hello!</p>;
  }

  return (
    <div className="app__greeting">
      <p>Hello, {user.name}!</p>
      <h3>Token Claims:</h3>
      <ul>
        {Object.entries(user).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{' '}
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const profileRoute: AnyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  beforeLoad: ({ context }) => {
    const auth: { auth?: { isAuthenticated: boolean } } = context as {
      auth?: { isAuthenticated: boolean };
    };
    if (!auth.auth?.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: ProfileComponent,
});
