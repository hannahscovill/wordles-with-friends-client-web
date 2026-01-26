import { useState, type ReactElement } from 'react';
import './Avatar.scss';

export type AvatarSize = 's' | 'm' | 'l';

export interface AvatarProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Size variant */
  size?: AvatarSize;
  /** Show edit overlay on hover */
  editable?: boolean;
  /** Callback when edit overlay is clicked */
  onEditClick?: () => void;
}

const FALLBACK_IMAGE: string =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23ccc"/%3E%3Ccircle cx="50" cy="40" r="18" fill="%23fff"/%3E%3Cellipse cx="50" cy="85" rx="30" ry="25" fill="%23fff"/%3E%3C/svg%3E';

export const Avatar = ({
  src,
  alt,
  size = 'm',
  editable = false,
  onEditClick,
}: AvatarProps): ReactElement => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = (): void => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_IMAGE);
    }
  };

  const handleClick = (): void => {
    if (editable && onEditClick) {
      onEditClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (
      editable &&
      onEditClick &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault();
      onEditClick();
    }
  };

  return (
    <div
      className={`avatar avatar--${size} ${editable ? 'avatar--editable' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      aria-label={editable ? `Edit ${alt}` : undefined}
    >
      <img
        src={imgSrc}
        alt={alt}
        className="avatar__image"
        onError={handleError}
      />
      {editable && (
        <div className="avatar__overlay" aria-hidden="true">
          <span className="avatar__edit-icon">Edit</span>
        </div>
      )}
    </div>
  );
};
