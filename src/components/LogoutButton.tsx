import type { ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton = (): ReactElement => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className="auth-button logout"
    >
      Log Out
    </button>
  );
};

export default LogoutButton;
