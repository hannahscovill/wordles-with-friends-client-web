import { useState, useEffect, type ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  ProfileForm,
  type ProfileFormData,
} from '../components/features/ProfileForm';
import {
  updateUserProfile,
  getUserProfile,
  uploadAvatar,
  type UserProfile,
  type UploadAvatarResponse,
} from '../api/profile';
import { Spinner } from '../components/ui/Spinner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './ProfilePage.scss';

interface AuthTokens {
  access_token: string;
  id_token: string;
}

export const ProfilePage = (): ReactElement => {
  const {
    user,
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const [authTokens] = useLocalStorage<AuthTokens>('auth_tokens');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    email: '',
    displayName: '',
    avatarUrl: '',
  });

  // Check if we have stored tokens - if not, redirect immediately without waiting for Auth0
  const hasStoredTokens: boolean =
    authTokens !== null && authTokens.access_token !== '';

  // Start login flow if not authenticated
  // If no tokens in localStorage, redirect immediately without waiting for Auth0 to load
  // If tokens exist, wait for Auth0 to validate them first
  useEffect(() => {
    if (!hasStoredTokens && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/profile' },
      });
    } else if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: '/profile' },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, hasStoredTokens]);

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
    avatarFile?: File;
  }): Promise<void> => {
    setIsSaving(true);
    try {
      const token: string = await getAccessTokenSilently();

      let finalAvatarUrl: string = data.avatarUrl;

      // If there's a new avatar file, upload it first
      if (data.avatarFile) {
        const uploadResponse: UploadAvatarResponse = await uploadAvatar(
          token,
          data.avatarFile,
        );
        finalAvatarUrl = uploadResponse.avatarUrl;
      }

      await updateUserProfile(token, {
        displayName: data.displayName,
        avatarUrl: finalAvatarUrl,
      });

      // Update local profile data to reflect the saved changes
      setProfileData({
        ...profileData,
        displayName: data.displayName,
        avatarUrl: finalAvatarUrl,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If no stored tokens, show redirect spinner immediately (don't wait for Auth0)
  if (!hasStoredTokens && !isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <Spinner size="large" label="Redirecting to login" />
        </div>
      </div>
    );
  }

  // If we have stored tokens, wait for Auth0 to validate them
  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">
          <Spinner size="large" label="Loading profile" />
        </div>
      </div>
    );
  }

  // Auth0 finished loading but user is not authenticated (tokens were invalid)
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
