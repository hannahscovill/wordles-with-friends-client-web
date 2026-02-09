import { useState, useEffect, type ReactElement } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  ProfileForm,
  type ProfileFormData,
} from '../components/features/ProfileForm';
import {
  updateUserProfile,
  uploadAvatar,
  revertAvatar,
  type UploadAvatarResponse,
} from '../api';
import { useUserProfile } from '../contexts/UserProfileContext';
import './ProfilePage.scss';

export const ProfilePage = (): ReactElement => {
  // Router protects this route - we trust we're authenticated if rendering
  const { user, getAccessTokenSilently } = useAuth0();
  const {
    profile,
    isLoading: isLoadingProfile,
    refreshProfile,
  } = useUserProfile();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    email: '',
    displayName: '',
    avatarUrl: '',
    name: '',
    pronouns: '',
  });

  // Sync profile data from context when it loads
  useEffect(() => {
    if (isLoadingProfile || !user) {
      return;
    }

    setProfileData({
      email: profile?.email ?? user.email ?? '',
      displayName: profile?.displayName ?? '',
      avatarUrl: profile?.avatarUrl ?? 'https://www.gravatar.com/avatar/?d=mp',
      name: profile?.name ?? '',
      pronouns: profile?.pronouns ?? '',
    });
  }, [isLoadingProfile, user, profile]);

  const handleSubmit = async (data: {
    displayName: string;
    name: string;
    pronouns: string;
    avatarUrl: string;
    avatarFile?: File;
  }): Promise<void> => {
    setIsSaving(true);
    try {
      const token: string = await getAccessTokenSilently();

      // If there's a new avatar file, upload it first
      if (data.avatarFile) {
        const uploadResponse: UploadAvatarResponse = await uploadAvatar(
          token,
          data.avatarFile,
        );
        // Upload endpoint stores the key server-side; no need to send avatarUrl
        await updateUserProfile(token, {
          displayName: data.displayName,
          name: data.name,
          pronouns: data.pronouns,
        });

        // Update local form state with the new presigned URL
        setProfileData({
          ...profileData,
          displayName: data.displayName,
          name: data.name,
          pronouns: data.pronouns,
          avatarUrl: uploadResponse.avatarUrl,
        });
      } else {
        await updateUserProfile(token, {
          displayName: data.displayName,
          name: data.name,
          pronouns: data.pronouns,
        });

        setProfileData({
          ...profileData,
          displayName: data.displayName,
          name: data.name,
          pronouns: data.pronouns,
        });
      }

      // Refresh the shared profile context so the header avatar updates immediately
      await refreshProfile();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevertAvatar = async (): Promise<void> => {
    const token: string = await getAccessTokenSilently();
    const response: UploadAvatarResponse = await revertAvatar(token);
    setProfileData({
      ...profileData,
      avatarUrl: response.avatarUrl,
    });
    await refreshProfile();
  };

  // Router protects this route, so we always render the form
  // ProfileForm handles its own loading state via isLoading prop
  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Profile</h1>
      <ProfileForm
        initialData={profileData}
        onSubmit={handleSubmit}
        onRevertAvatar={handleRevertAvatar}
        isLoading={isLoadingProfile}
        isSaving={isSaving}
      />
    </div>
  );
};
