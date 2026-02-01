import type { ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Link,
  useNavigate,
  type UseNavigateResult,
} from '@tanstack/react-router';
import { AvatarMenu } from './AvatarMenu';
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

  // Use avatar_url from user_metadata if available, otherwise fall back to Auth0 picture
  const userMetadata: Record<string, unknown> | undefined = (
    user as Record<string, unknown> | undefined
  )?.user_metadata as Record<string, unknown> | undefined;
  const avatarSrc: string =
    (userMetadata?.avatar_url as string | undefined) ??
    user?.picture ??
    'https://www.gravatar.com/avatar/?d=mp';
  const avatarAlt: string = user?.email ?? user?.name ?? 'User avatar';

  return (
    <header className="app-header">
      <h1 className="app-header__title">
        <Link to="/">{title}</Link>
      </h1>
      <div className="app-header__actions">
        <AvatarMenu
          avatarSrc={avatarSrc}
          avatarAlt={avatarAlt}
          isLoggedIn={isAuthenticated}
          onLogInClick={() => loginWithRedirect()}
          onProfileClick={() => navigate({ to: '/profile' })}
          onScoreHistoryClick={() => navigate({ to: '/history' })}
          onLogOutClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        />
      </div>
    </header>
  );
};
