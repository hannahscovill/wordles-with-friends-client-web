import type { ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Profile = (): ReactElement | null => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div className="loading-text">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile">
      <img
        src={user.picture}
        alt={user.name || 'User'}
        className="profile-picture"
      />
      <div className="profile-info">
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
      </div>
    </div>
  );
};

export default Profile;
