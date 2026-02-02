import { useState, type ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Link,
  useNavigate,
  type UseNavigateResult,
} from '@tanstack/react-router';
import { AvatarMenu } from './AvatarMenu';
import { IssueReportModal } from './IssueReportModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './AppHeader.scss';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

export interface AppHeaderProps {
  /** The title to display in the header */
  title?: string;
}

export const AppHeader = ({
  title = 'Wordles with Friends',
}: AppHeaderProps): ReactElement => {
  const { isAuthenticated, isLoading, user, loginWithRedirect, logout } =
    useAuth0();
  const navigate: UseNavigateResult<string> = useNavigate();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [authTokens] = useLocalStorage<AuthTokens>('auth_tokens');

  // Check if we have stored tokens - used to show logged-in UI while Auth0 validates
  const hasStoredTokens: boolean =
    authTokens !== null && authTokens.access_token !== '';

  // Consider user logged in if Auth0 confirms it, OR if Auth0 is still loading
  // but we have stored tokens (optimistic UI to avoid flash of logged-out state)
  const isLoggedIn: boolean = isAuthenticated || (isLoading && hasStoredTokens);

  // Use avatar_url from user_metadata if available, otherwise fall back to Auth0 picture
  const userMetadata: Record<string, unknown> | undefined = (
    user as Record<string, unknown> | undefined
  )?.user_metadata as Record<string, unknown> | undefined;
  const appMetadata: Record<string, unknown> | undefined = (
    user as Record<string, unknown> | undefined
  )?.['wordles.dev/app_metadata'] as Record<string, unknown> | undefined;
  const avatarSrc: string =
    (userMetadata?.avatar_url as string | undefined) ??
    user?.picture ??
    'https://www.gravatar.com/avatar/?d=mp';
  const avatarAlt: string = user?.email ?? user?.name ?? 'User avatar';
  const isGameAdmin: boolean = appMetadata?.game_admin === true;

  return (
    <>
      <header className="app-header">
        <h1 className="app-header__title">
          <Link to="/">{title}</Link>
        </h1>
        <div className="app-header__actions">
          <AvatarMenu
            avatarSrc={avatarSrc}
            avatarAlt={avatarAlt}
            isLoggedIn={isLoggedIn}
            isGameAdmin={isGameAdmin}
            onLogInClick={() => loginWithRedirect()}
            onProfileClick={() => navigate({ to: '/profile' })}
            onScoreHistoryClick={() => navigate({ to: '/history' })}
            onGameMakerClick={() => navigate({ to: '/gamemaker' })}
            onLogOutClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            onReportIssueClick={() => setIsIssueModalOpen(true)}
          />
        </div>
      </header>
      {isIssueModalOpen && (
        <IssueReportModal onClose={() => setIsIssueModalOpen(false)} />
      )}
    </>
  );
};
