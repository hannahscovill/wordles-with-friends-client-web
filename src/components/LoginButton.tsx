import type { ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = (): ReactElement => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button onClick={() => loginWithRedirect()} className="auth-button login">
      Log In
    </button>
  );
};

export default LoginButton;
