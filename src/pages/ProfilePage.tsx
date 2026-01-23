import type { ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export const ProfilePage = (): ReactElement => {
  const { user, isLoading } = useAuth0();

  if (isLoading || !user) {
    return <p className="app__greeting">Loading profile...</p>;
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
