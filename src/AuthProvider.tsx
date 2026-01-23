import { useEffect, type ReactElement, type ReactNode } from 'react';
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
    getAccessTokenSilently,
    getIdTokenClaims,
  } = auth;

  const [, setAuthTokens] = useLocalStorage<AuthTokens>('auth_tokens');

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
      }
    };

    storeTokens();
  }, [
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    getIdTokenClaims,
    setAuthTokens,
  ]);

  return <>{children}</>;
};
