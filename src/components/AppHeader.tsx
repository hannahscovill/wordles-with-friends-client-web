import type { ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Link,
  useNavigate,
  type UseNavigateResult,
} from '@tanstack/react-router';
import { Button } from './Button';
import './AppHeader.scss';

export interface AppHeaderProps {
  /** The title to display in the header */
  title?: string;
}

export const AppHeader = ({
  title = 'Wordles with Friends',
}: AppHeaderProps): ReactElement => {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const navigate: UseNavigateResult<string> = useNavigate();

  const avatarSrc: string =
    user?.picture ?? 'https://www.gravatar.com/avatar/?d=mp';
  const avatarAlt: string = user?.name ?? 'User avatar';

  return (
    <header className="app-header">
      <h1 className="app-header__title">
        <Link to="/">{title}</Link>
      </h1>
      <div className="app-header__actions">
        {isAuthenticated ? (
          <Button
            size="s"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Sign Out
          </Button>
        ) : (
          <Button size="s" onClick={() => loginWithRedirect()}>
            Sign In
          </Button>
        )}
        <button
          type="button"
          className="app-header__avatar"
          aria-label={isAuthenticated ? 'View profile' : 'Sign in'}
          onClick={() =>
            isAuthenticated ? navigate({ to: '/profile' }) : loginWithRedirect()
          }
        >
          <img src={avatarSrc} alt={avatarAlt} />
        </button>
      </div>
    </header>
  );
};
