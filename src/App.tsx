import type { ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AppHeader } from './components/AppHeader';
import './App.scss';

const App = (): ReactElement => {
  const { isAuthenticated, isLoading, error, user } = useAuth0();

  if (isLoading) {
    return (
      <div className="app">
        <main className="app__content">
          <p className="app__greeting">Loading...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <AppHeader />
        <main className="app__content">
          <p className="app__greeting">Something went wrong: {error.message}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <AppHeader />
      <main className="app__content">
        {isAuthenticated && user ? (
          <div className="app__greeting">
            <p>Hello, {user.name}!</p>
            <h3>Token Claims:</h3>
            <ul>
              {Object.entries(user).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong>{' '}
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="app__greeting">Hello!</p>
        )}
      </main>
    </div>
  );
};

export default App;
