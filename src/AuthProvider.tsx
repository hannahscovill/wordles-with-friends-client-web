import type { ReactElement, ReactNode } from 'react';
import { useAuth0, type Auth0ContextInterface } from '@auth0/auth0-react';
import { router } from './router';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): ReactElement => {
  const auth: Auth0ContextInterface = useAuth0();
  router.update({ context: { auth } });
  return <>{children}</>;
};
