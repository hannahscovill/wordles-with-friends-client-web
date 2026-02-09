import { useState, type ReactElement, type FormEvent } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Avatar } from '../../ui/Avatar';
import { AvatarUploader } from '../AvatarUploader';
import './ProfileForm.scss';

const MAX_DISPLAY_NAME_LENGTH: number = 100;
const MAX_NAME_LENGTH: number = 100;
const MAX_PRONOUNS_LENGTH: number = 50;

export interface ProfileFormData {
  email: string;
  displayName: string;
  avatarUrl: string;
  name: string;
  pronouns: string;
}

export interface ProfileFormProps {
  /** Initial profile data */
  initialData: ProfileFormData;
  /** Callback when form is submitted */
  onSubmit: (data: {
    displayName: string;
    name: string;
    pronouns: string;
    avatarUrl: string;
    avatarFile?: File;
  }) => Promise<void>;
  /** URL to revert avatar to (user.picture from Auth0 token) */
  revertPreviewUrl?: string;
  /** Whether profile data is loading */
  isLoading?: boolean;
  /** Whether form is currently saving */
  isSaving?: boolean;
}

/** Check if the avatar is a custom upload (S3 presigned URL) vs a Gravatar/external URL */
const isCustomAvatar = (url: string): boolean => {
  if (!url) return false;
  // S3 presigned URLs contain X-Amz-Signature or come from amazonaws.com
  return url.includes('amazonaws.com') || url.includes('X-Amz-Signature');
};

export const ProfileForm = ({
  initialData,
  onSubmit,
  revertPreviewUrl,
  isLoading = false,
  isSaving = false,
}: ProfileFormProps): ReactElement => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(
    initialData.displayName,
  );
  const [name, setName] = useState<string>(initialData.name);
  const [pronouns, setPronouns] = useState<string>(initialData.pronouns);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData.avatarUrl);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isAvatarUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prevInitialData, setPrevInitialData] =
    useState<ProfileFormData>(initialData);

  // Sync local state when initialData changes (during render, not in effect)
  if (
    initialData.displayName !== prevInitialData.displayName ||
    initialData.avatarUrl !== prevInitialData.avatarUrl ||
    initialData.name !== prevInitialData.name ||
    initialData.pronouns !== prevInitialData.pronouns
  ) {
    setPrevInitialData(initialData);
    setDisplayName(initialData.displayName);
    setName(initialData.name);
    setPronouns(initialData.pronouns);
    setAvatarUrl(initialData.avatarUrl);
  }

  const hasChanges: boolean =
    displayName !== initialData.displayName ||
    name !== initialData.name ||
    pronouns !== initialData.pronouns ||
    avatarUrl !== initialData.avatarUrl ||
    pendingAvatarFile !== null;

  const displayNameError: string | undefined =
    displayName.length > MAX_DISPLAY_NAME_LENGTH
      ? `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or less`
      : undefined;

  const handleDisplayNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setDisplayName(event.target.value);
    setError(null);
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setName(event.target.value);
    setError(null);
  };

  const handlePronounsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setPronouns(event.target.value);
    setError(null);
  };

  const handleAvatarSelect = (file: File): void => {
    // Create a local preview URL
    const url: string = URL.createObjectURL(file);
    setAvatarUrl(url);
    setPendingAvatarFile(file);
    setError(null);
  };

  const handleRevertAvatar = (): void => {
    if (!revertPreviewUrl) return;
    setAvatarUrl(revertPreviewUrl);
    setPendingAvatarFile(null);
    setError(null);
  };

  const handleCancel = (): void => {
    setDisplayName(initialData.displayName);
    setName(initialData.name);
    setPronouns(initialData.pronouns);
    setAvatarUrl(initialData.avatarUrl);
    setPendingAvatarFile(null);
    setError(null);
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (displayNameError) {
      return;
    }

    try {
      await onSubmit({
        displayName,
        name,
        pronouns,
        avatarUrl,
        avatarFile: pendingAvatarFile ?? undefined,
      });

      // Clean up blob URL if we had one
      if (pendingAvatarFile) {
        URL.revokeObjectURL(avatarUrl);
        setPendingAvatarFile(null);
      }

      setIsEditing(false);
    } catch {
      setError('Failed to save changes. Please try again.');
    }
  };

  if (!isEditing) {
    return (
      <div className="profile-form">
        <div className="profile-form__avatar">
          <Avatar src={avatarUrl} alt="Profile avatar" size="l" />
        </div>

        <div className="profile-form__field">
          <span className="profile-form__label">Name</span>
          <span className="profile-form__value">{name || '—'}</span>
        </div>

        {pronouns && (
          <div className="profile-form__field">
            <span className="profile-form__label">Pronouns</span>
            <span className="profile-form__value">{pronouns}</span>
          </div>
        )}

        <div className="profile-form__field">
          <span className="profile-form__label">Display Name</span>
          <span className="profile-form__value">{displayName || '—'}</span>
        </div>

        <div className="profile-form__field">
          <span className="profile-form__label">Email</span>
          <span className="profile-form__value">{initialData.email}</span>
        </div>

        <div className="profile-form__actions">
          <Button
            size="s"
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
          >
            Edit Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form__avatar">
        <AvatarUploader
          currentSrc={avatarUrl}
          onImageSelect={handleAvatarSelect}
          isUploading={isAvatarUploading}
        />
      </div>

      {revertPreviewUrl && isCustomAvatar(avatarUrl) && (
        <div className="profile-form__revert-wrapper">
          <button
            type="button"
            className="profile-form__revert-avatar"
            onClick={handleRevertAvatar}
            disabled={isSaving}
          >
            Revert to Gravatar
          </button>
          {revertPreviewUrl && (
            <div className="profile-form__revert-preview">
              <img
                src={revertPreviewUrl}
                alt="Gravatar preview"
                className="profile-form__revert-preview-img"
              />
            </div>
          )}
        </div>
      )}

      <div className="profile-form__field">
        <Input
          label="Name"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter your name"
          maxLength={MAX_NAME_LENGTH + 10}
          fullWidth
          disabled={isLoading || isSaving}
        />
      </div>

      <div className="profile-form__field">
        <Input
          label="Pronouns"
          value={pronouns}
          onChange={handlePronounsChange}
          placeholder="e.g. she/her, he/him, they/them"
          maxLength={MAX_PRONOUNS_LENGTH + 10}
          fullWidth
          disabled={isLoading || isSaving}
        />
      </div>

      <div className="profile-form__field">
        <Input
          label="Display Name"
          value={displayName}
          onChange={handleDisplayNameChange}
          error={displayNameError}
          maxLength={MAX_DISPLAY_NAME_LENGTH + 10}
          fullWidth
          disabled={isLoading || isSaving}
        />
        <span className="profile-form__char-count">
          {displayName.length}/{MAX_DISPLAY_NAME_LENGTH}
        </span>
      </div>

      <div className="profile-form__field">
        <span className="profile-form__label">Email</span>
        <span className="profile-form__value">{initialData.email}</span>
      </div>

      {error && <p className="profile-form__error">{error}</p>}

      <div className="profile-form__actions">
        <Button
          size="s"
          type="button"
          onClick={handleCancel}
          disabled={isLoading || isSaving}
        >
          Cancel
        </Button>
        <Button
          size="s"
          type="submit"
          disabled={
            isLoading || !hasChanges || Boolean(displayNameError) || isSaving
          }
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
