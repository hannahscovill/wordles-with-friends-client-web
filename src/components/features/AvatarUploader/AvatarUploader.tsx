import { useState, useRef, type ReactElement, type DragEvent } from 'react';
import { Spinner } from '../../ui/Spinner';
import { compressImage } from './compressImage';
import './AvatarUploader.scss';

const MIN_DIMENSION: number = 500;
const ALLOWED_TYPES: string[] = ['image/jpeg', 'image/png'];
const FALLBACK_IMAGE: string = 'https://www.gravatar.com/avatar/?d=mp';

export interface AvatarUploaderProps {
  /** Current avatar URL (optional - shows placeholder if not provided) */
  currentSrc?: string;
  /** Callback when new image is selected (returns File, not uploaded yet) */
  onImageSelect: (file: File) => void;
  /** Loading state during upload */
  isUploading?: boolean;
}

interface ValidationError {
  type: 'type' | 'dimensions';
  message: string;
}

const validateFile = (file: File): Promise<ValidationError | null> => {
  return new Promise((resolve) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      resolve({
        type: 'type',
        message: 'Please select a JPEG or PNG image.',
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
  const [imgError, setImgError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const inputRef: React.RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement>(null);

  const rawSrc: string | null = previewUrl ?? currentSrc ?? null;
  const displaySrc: string | null = imgError ? FALLBACK_IMAGE : rawSrc;

  const handleFileSelect = async (file: File): Promise<void> => {
    setError(null);

    const validationError: ValidationError | null = await validateFile(file);
    if (validationError) {
      setError(validationError.message);
      return;
    }

    // Compress if needed (resizes large images and reduces JPEG quality)
    let processedFile: File = file;
    setIsCompressing(true);
    try {
      processedFile = await compressImage(file);
    } catch (err: unknown) {
      const message: string =
        err instanceof Error
          ? err.message
          : 'Image compression failed. Please try a smaller image.';
      setError(message);
      setIsCompressing(false);
      return;
    }
    setIsCompressing(false);

    // Clean up old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create preview URL
    const url: string = URL.createObjectURL(processedFile);
    setPreviewUrl(url);
    onImageSelect(processedFile);
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

  const handleDropzoneClick = (): void => {
    inputRef.current?.click();
  };

  return (
    <div className="avatar-uploader">
      {/* Visually hidden but DOM-present file input. Programmatic .click()
          works in all browsers (including Safari) when triggered from a
          user gesture — which the onClick on the dropzone div provides. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleInputChange}
        className="avatar-uploader__hidden-input"
        aria-label="Upload avatar image"
        tabIndex={-1}
      />

      <div
        className={`avatar-uploader__dropzone ${isDragging ? 'avatar-uploader__dropzone--dragging' : ''} ${displaySrc ? 'avatar-uploader__dropzone--has-image' : ''}`}
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDropzoneClick();
          }
        }}
      >
        {isUploading || isCompressing ? (
          <div className="avatar-uploader__loading">
            <Spinner
              size="medium"
              label={isCompressing ? 'Compressing image' : 'Uploading avatar'}
            />
          </div>
        ) : displaySrc ? (
          <>
            <img
              src={displaySrc}
              alt="Avatar preview"
              className="avatar-uploader__preview-image"
              onError={(): void => setImgError(true)}
            />
            <div className="avatar-uploader__pencil-overlay" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </div>
          </>
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
