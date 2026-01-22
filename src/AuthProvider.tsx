import { useEffect, type ReactElement, type ReactNode } from 'react';
import { useAuth0, type Auth0ContextInterface } from '@auth0/auth0-react';
import { router } from './router';
import { useLocalStorage } from './hooks/useLocalStorage';

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

  const [, setAccessToken] = useLocalStorage<string>('access_token');
  const [, setIdToken] = useLocalStorage<string>('id_token');

  useEffect(() => {
    router.update({ context: { auth } });
  }, [auth]);

  useEffect(() => {
    const storeTokens = async (): Promise<void> => {
      if (isLoading) return;

      if (!isAuthenticated) {
        setAccessToken(null);
        setIdToken(null);
        return;
      }

      try {
        const [accessToken, idTokenClaims] = await Promise.all([
          getAccessTokenSilently(),
          getIdTokenClaims(),
        ]);

        if (accessToken) {
          setAccessToken(accessToken);
        }

        if (idTokenClaims?.__raw) {
          setIdToken(idTokenClaims.__raw);
        }
      } catch (error) {
        console.error('Failed to store auth tokens:', error);
        setAccessToken(null);
        setIdToken(null);
      }
    };

    storeTokens();
  }, [
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    getIdTokenClaims,
    setAccessToken,
    setIdToken,
  ]);

  return <>{children}</>;
};
