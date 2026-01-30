import {
  useEffect,
  useRef,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAuth0, type Auth0ContextInterface } from '@auth0/auth0-react';
import { useLocalStorage } from './hooks/useLocalStorage';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
  const auth: Auth0ContextInterface = useAuth0();
  const {
    isAuthenticated,
    isLoading,
    error,
    getAccessTokenSilently,
    getIdTokenClaims,
    loginWithRedirect,
  } = auth;

  const [, setAuthTokens] = useLocalStorage<AuthTokens>('auth_tokens');
  const hasRedirected: MutableRefObject<boolean> = useRef(false);

  // Handle Auth0 errors (e.g., login_required, consent_required)
  // This only triggers when a user actively tries to login and encounters an error
  useEffect(() => {
    if (error && !hasRedirected.current) {
      console.error('Auth0 error:', error);
      setAuthTokens(null);
      hasRedirected.current = true;
      loginWithRedirect();
    }
  }, [error, setAuthTokens, loginWithRedirect]);

  useEffect(() => {
    const storeTokens = async (): Promise<void> => {
      if (isLoading) return;

      if (!isAuthenticated) {
        setAuthTokens(null);
        return;
      }

      try {
        const [accessToken, idTokenClaims] = await Promise.all([
          getAccessTokenSilently(),
          getIdTokenClaims(),
        ]);

        setAuthTokens({
          access_token: accessToken ?? '',
          id_token: idTokenClaims?.__raw ?? '',
        });
      } catch (error) {
        console.error('Failed to store auth tokens:', error);
        setAuthTokens(null);
        // Token is expired or invalid - redirect to login
        loginWithRedirect();
      }
    };

    storeTokens();
  }, [
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    getIdTokenClaims,
    setAuthTokens,
    loginWithRedirect,
  ]);

  return <>{children}</>;
};
