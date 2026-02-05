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
} from '../api';
import './ProfilePage.scss';

export const ProfilePage = (): ReactElement => {
  // Router protects this route - we trust we're authenticated if rendering
  const { user, getAccessTokenSilently } = useAuth0();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    email: '',
    displayName: '',
    avatarUrl: '',
  });

  // Load user profile data when user becomes available
  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (!user) {
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

    loadProfile();
  }, [user, getAccessTokenSilently]);

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

  // Router protects this route, so we always render the form
  // ProfileForm handles its own loading state via isLoading prop
  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Profile</h1>
      <ProfileForm
        initialData={profileData}
        onSubmit={handleSubmit}
        isLoading={isLoadingProfile}
        isSaving={isSaving}
      />
    </div>
  );
};
