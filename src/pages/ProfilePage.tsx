import { useState, useEffect, type ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  ProfileForm,
  type ProfileFormData,
} from '../components/features/ProfileForm';
import {
  updateUserProfile,
  getUserProfile,
  type UserProfile,
} from '../api/profile';
import { Spinner } from '../components/ui/Spinner';
import './ProfilePage.scss';

export const ProfilePage = (): ReactElement => {
  const {
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    email: '',
    displayName: '',
    avatarUrl: '',
  });

  // Start login flow if not authenticated (wait for Auth0 to finish loading first)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/profile' },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        const token: string = await getAccessTokenSilently();
        const profile: UserProfile | null = await getUserProfile(token);

        // Get display_name from token's user_metadata
        const tokenDisplayName: string | undefined =
          (user as Record<string, unknown>).user_metadata &&
          typeof (user as Record<string, unknown>).user_metadata === 'object'
            ? ((
                (user as Record<string, unknown>).user_metadata as Record<
                  string,
                  unknown
                >
              ).display_name as string | undefined)
            : undefined;

        setProfileData({
          email: user.email ?? '',
          displayName: tokenDisplayName ?? profile?.displayName ?? '',
          avatarUrl: profile?.avatarUrl ?? user.picture ?? '',
        });
      } catch {
        // Fallback to Auth0 user data if profile fetch fails
        const tokenDisplayName: string | undefined =
          (user as Record<string, unknown>).user_metadata &&
          typeof (user as Record<string, unknown>).user_metadata === 'object'
            ? ((
                (user as Record<string, unknown>).user_metadata as Record<
                  string,
                  unknown
                >
              ).display_name as string | undefined)
            : undefined;

        setProfileData({
          email: user.email ?? '',
          displayName: tokenDisplayName ?? '',
          avatarUrl: user.picture ?? '',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (!isLoading && isAuthenticated) {
      loadProfile();
    }
  }, [isLoading, isAuthenticated, user, getAccessTokenSilently]);

  const handleSubmit = async (data: {
    displayName: string;
    avatarUrl: string;
  }): Promise<void> => {
    setIsSaving(true);
    try {
      const token: string = await getAccessTokenSilently();
      await updateUserProfile(token, {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
      });

      // Update local profile data to reflect the saved changes
      setProfileData({
        ...profileData,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <Spinner size="large" label="Loading profile" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <Spinner size="large" label="Redirecting to login" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <ProfileForm
        initialData={profileData}
        onSubmit={handleSubmit}
        isLoading={isLoadingProfile}
        isSaving={isSaving}
      />
    </div>
  );
};
