import {
  useEffect,
  useRef,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
} from 'react';
import { useAuth0, type Auth0ContextInterface } from '@auth0/auth0-react';
import { useLocalStorage } from './hooks/useLocalStorage';

const AUTH_LOADING_TIMEOUT_MS: number = 10000;

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
  useEffect(() => {
    if (error && !hasRedirected.current) {
      console.error('Auth0 error:', error);
      setAuthTokens(null);
      hasRedirected.current = true;
      loginWithRedirect();
    }
  }, [error, setAuthTokens, loginWithRedirect]);

  // Handle stuck loading state - if Auth0 takes too long, clear tokens and redirect
  useEffect(() => {
    if (!isLoading) return;

    const timeoutId: ReturnType<typeof setTimeout> = setTimeout((): void => {
      if (isLoading && !hasRedirected.current) {
        console.warn('Auth0 loading timeout - redirecting to login');
        setAuthTokens(null);
        hasRedirected.current = true;
        loginWithRedirect();
      }
    }, AUTH_LOADING_TIMEOUT_MS);

    return (): void => clearTimeout(timeoutId);
  }, [isLoading, setAuthTokens, loginWithRedirect]);

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
