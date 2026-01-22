import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useAuth0, type Auth0ContextInterface } from '@auth0/auth0-react';
import { router } from './router';

const ACCESS_TOKEN_KEY: string = 'access_token';
const ID_TOKEN_KEY: string = 'id_token';

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

  useEffect(() => {
    router.update({ context: { auth } });
  }, [auth]);

  useEffect(() => {
    const storeTokens = async (): Promise<void> => {
      if (isLoading) return;

      if (!isAuthenticated) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(ID_TOKEN_KEY);
        return;
      }

      try {
        const [accessToken, idTokenClaims] = await Promise.all([
          getAccessTokenSilently(),
          getIdTokenClaims(),
        ]);

        if (accessToken) {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }

        if (idTokenClaims?.__raw) {
          localStorage.setItem(ID_TOKEN_KEY, idTokenClaims.__raw);
        }
      } catch (error) {
        console.error('Failed to store auth tokens:', error);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(ID_TOKEN_KEY);
      }
    };

    storeTokens();
  }, [isAuthenticated, isLoading, getAccessTokenSilently, getIdTokenClaims]);

  return <>{children}</>;
};
