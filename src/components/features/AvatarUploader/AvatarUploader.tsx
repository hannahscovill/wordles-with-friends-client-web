import { useState, type ReactElement } from 'react';
import { Avatar, type AvatarSize } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { FileUpload } from '../../ui/FileUpload';
import { Modal } from '../../ui/Modal';
import './AvatarUploader.scss';

const MAX_FILE_SIZE: number = 2 * 1024 * 1024; // 2MB
const MIN_DIMENSION: number = 500;
const ALLOWED_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export interface AvatarUploaderProps {
  /** Current avatar URL */
  currentSrc: string;
  /** Alt text */
  alt: string;
  /** Callback when new image is selected (returns File, not uploaded yet) */
  onImageSelect: (file: File) => void;
  /** Loading state during upload */
  isUploading?: boolean;
  /** Size of the avatar display */
  size?: AvatarSize;
}

interface ValidationError {
  type: 'size' | 'type' | 'dimensions';
  message: string;
}

const validateFile = (file: File): Promise<ValidationError | null> => {
  return new Promise((resolve) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      resolve({
        type: 'type',
        message: 'Please select a JPEG, PNG, GIF, or WebP image.',
      });
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      resolve({
        type: 'size',
        message: 'Image must be less than 2MB.',
      });
      return;
    }

    // Check dimensions
    const img: HTMLImageElement = new Image();
    img.onload = (): void => {
      URL.revokeObjectURL(img.src);
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        resolve({
          type: 'dimensions',
          message: `Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`,
        });
      } else {
        resolve(null);
      }
    };
    img.onerror = (): void => {
      URL.revokeObjectURL(img.src);
      resolve({
        type: 'type',
        message: 'Unable to read image. Please try a different file.',
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

export const AvatarUploader = ({
  currentSrc,
  alt,
  onImageSelect,
  isUploading = false,
  size = 'l',
}: AvatarUploaderProps): ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = (): void => {
    setIsModalOpen(true);
    setError(null);
  };

  const handleFileSelect = async (file: File): Promise<void> => {
    setError(null);

    const validationError: ValidationError | null = await validateFile(file);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    // Create preview URL
    const url: string = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  };

  const handleCancel = (): void => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    setIsModalOpen(false);
  };

  const handleConfirm = (): void => {
    if (selectedFile) {
      onImageSelect(selectedFile);
    }
    handleCancel();
  };

  return (
    <>
      <div className="avatar-uploader">
        {isUploading ? (
          <div
            className={`avatar-uploader__loading avatar-uploader__loading--${size}`}
          >
            <span className="avatar-uploader__spinner" />
          </div>
        ) : (
          <Avatar
            src={currentSrc}
            alt={alt}
            size={size}
            editable
            onEditClick={handleEditClick}
          />
        )}
      </div>

      {isModalOpen && (
        <Modal>
          <h2 className="avatar-uploader__title">Change Avatar</h2>

          <div className="avatar-uploader__preview">
            <Avatar
              src={previewUrl ?? currentSrc}
              alt={selectedFile ? 'New avatar preview' : alt}
              size="l"
            />
          </div>

          {error && <p className="avatar-uploader__error">{error}</p>}

          <FileUpload accept="image/*" onFileSelect={handleFileSelect}>
            <Button size="s" variant="onLight">
              {selectedFile ? 'Choose Different' : 'Choose Image'}
            </Button>
          </FileUpload>

          <div className="avatar-uploader__actions">
            <Button size="s" variant="onLight" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="s"
              variant="onLight"
              onClick={handleConfirm}
              disabled={!selectedFile}
            >
              Confirm
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};
