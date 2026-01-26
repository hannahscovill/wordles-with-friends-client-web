import { useState, type ReactElement, type FormEvent } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { AvatarUploader } from '../AvatarUploader';
import './ProfileForm.scss';

const MAX_DISPLAY_NAME_LENGTH: number = 100;

export interface ProfileFormData {
  email: string;
  displayName: string;
  avatarUrl: string;
}

export interface ProfileFormProps {
  /** Initial profile data */
  initialData: ProfileFormData;
  /** Callback when form is submitted */
  onSubmit: (data: { displayName: string; avatarUrl: string }) => Promise<void>;
  /** Whether form is currently saving */
  isSaving?: boolean;
}

export const ProfileForm = ({
  initialData,
  onSubmit,
  isSaving = false,
}: ProfileFormProps): ReactElement => {
  const [displayName, setDisplayName] = useState<string>(
    initialData.displayName,
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData.avatarUrl);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [isAvatarUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges: boolean =
    displayName !== initialData.displayName ||
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

  const handleAvatarSelect = (file: File): void => {
    // Create a local preview URL
    const url: string = URL.createObjectURL(file);
    setAvatarUrl(url);
    setPendingAvatarFile(file);
    setError(null);
  };

  const handleCancel = (): void => {
    setDisplayName(initialData.displayName);
    setAvatarUrl(initialData.avatarUrl);
    setPendingAvatarFile(null);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (displayNameError) {
      return;
    }

    try {
      // If there's a pending avatar file, the parent component should handle upload
      // For now, we just pass the current avatarUrl (which may be a blob URL for preview)
      await onSubmit({
        displayName,
        avatarUrl,
      });

      // Clean up blob URL if we had one
      if (pendingAvatarFile) {
        URL.revokeObjectURL(avatarUrl);
        setPendingAvatarFile(null);
      }
    } catch {
      setError('Failed to save changes. Please try again.');
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form__avatar">
        <AvatarUploader
          currentSrc={avatarUrl}
          alt={`${displayName}'s avatar`}
          onImageSelect={handleAvatarSelect}
          isUploading={isAvatarUploading}
          size="l"
        />
      </div>

      <div className="profile-form__field">
        <span className="profile-form__label">Email</span>
        <span className="profile-form__email">{initialData.email}</span>
      </div>

      <div className="profile-form__field">
        <Input
          label="Display Name"
          value={displayName}
          onChange={handleDisplayNameChange}
          error={displayNameError}
          maxLength={MAX_DISPLAY_NAME_LENGTH + 10}
          fullWidth
        />
        <span className="profile-form__char-count">
          {displayName.length}/{MAX_DISPLAY_NAME_LENGTH}
        </span>
      </div>

      {error && <p className="profile-form__error">{error}</p>}

      <div className="profile-form__actions">
        <Button
          size="s"
          type="button"
          onClick={handleCancel}
          disabled={!hasChanges || isSaving}
        >
          Cancel
        </Button>
        <Button
          size="s"
          type="submit"
          disabled={!hasChanges || Boolean(displayNameError) || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};
