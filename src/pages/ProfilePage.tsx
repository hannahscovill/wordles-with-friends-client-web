import { useState, useEffect, type ReactElement } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
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
import './ProfilePage.scss';

export const ProfilePage = (): ReactElement => {
  const navigate: UseNavigateResult<string> = useNavigate();
  const { user, isLoading, isAuthenticated, getAccessTokenSilently } =
    useAuth0();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (!isAuthenticated || !user) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const token: string = await getAccessTokenSilently();
        const profile: UserProfile | null = await getUserProfile(token);

        setProfileData({
          email: user.email ?? '',
          displayName: profile?.displayName ?? user.name ?? '',
          avatarUrl: profile?.avatarUrl ?? user.picture ?? '',
        });
      } catch {
        // Fallback to Auth0 user data if profile fetch fails
        setProfileData({
          email: user.email ?? '',
          displayName: user.name ?? '',
          avatarUrl: user.picture ?? '',
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // Only load profile once auth is done loading
    if (!isLoading) {
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
      if (profileData) {
        setProfileData({
          ...profileData,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoadingProfile || !profileData) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-page__loading">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Profile</h1>
      <ProfileForm
        initialData={profileData}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
};
