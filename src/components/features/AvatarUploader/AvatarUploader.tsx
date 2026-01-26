import { useState, useRef, type ReactElement, type DragEvent } from 'react';
import { Spinner } from '../../ui/Spinner';
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
  /** Current avatar URL (optional - shows placeholder if not provided) */
  currentSrc?: string;
  /** Callback when new image is selected (returns File, not uploaded yet) */
  onImageSelect: (file: File) => void;
  /** Loading state during upload */
  isUploading?: boolean;
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
  onImageSelect,
  isUploading = false,
}: AvatarUploaderProps): ReactElement => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef: React.RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement>(null);

  const displaySrc: string | null = previewUrl ?? currentSrc ?? null;

  const handleFileSelect = async (file: File): Promise<void> => {
    setError(null);

    const validationError: ValidationError | null = await validateFile(file);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    // Clean up old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create preview URL
    const url: string = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageSelect(file);
  };

  const handleClick = (): void => {
    inputRef.current?.click();
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file: File | undefined = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file: File | undefined = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="avatar-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="avatar-uploader__input"
        aria-label="Upload avatar image"
      />

      <div
        className={`avatar-uploader__dropzone ${isDragging ? 'avatar-uploader__dropzone--dragging' : ''} ${displaySrc ? 'avatar-uploader__dropzone--has-image' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Click or drag to upload avatar image"
      >
        {isUploading ? (
          <div className="avatar-uploader__loading">
            <Spinner size="medium" label="Uploading avatar" />
          </div>
        ) : displaySrc ? (
          <img
            src={displaySrc}
            alt="Avatar preview"
            className="avatar-uploader__preview-image"
          />
        ) : (
          <span className="avatar-uploader__placeholder">
            Click or drag to upload
          </span>
        )}
      </div>

      {error && <p className="avatar-uploader__error">{error}</p>}
    </div>
  );
};
