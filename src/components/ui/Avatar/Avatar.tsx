import { useState, type ReactElement } from 'react';
import { reportError } from '../../../lib/telemetry';
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
  /** Callback to refresh the image source (e.g. fetch a fresh presigned URL) */
  onRefreshSrc?: () => Promise<void>;
}

const FALLBACK_IMAGE: string = 'https://www.gravatar.com/avatar/?d=mp';

export const Avatar = ({
  src,
  alt,
  size = 'm',
  editable = false,
  onEditClick,
  onRefreshSrc,
}: AvatarProps): ReactElement => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasTriedRefresh, setHasTriedRefresh] = useState<boolean>(false);
  const [prevSrc, setPrevSrc] = useState<string>(src);

  // Reset error state when src changes (during render, not in effect)
  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setHasTriedRefresh(false);
  }

  const imgSrc: string = hasError ? FALLBACK_IMAGE : src;

  const handleError = (): void => {
    // If we haven't tried refreshing yet and a refresh callback is provided,
    // attempt to get a fresh presigned URL before falling back to gravatar
    if (!hasTriedRefresh && onRefreshSrc) {
      setHasTriedRefresh(true);
      onRefreshSrc().catch(() => {
        setHasError(true);
      });
      return;
    }

    if (!hasError) {
      setHasError(true);
      reportError(new Error(`Avatar image failed to load: ${src}`), {
        'error.source': 'Avatar',
        'avatar.src': src,
      });
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
