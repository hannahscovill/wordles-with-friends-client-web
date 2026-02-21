import type { ReactElement } from 'react';
import './ShareIconButton.scss';

const isApplePlatform: boolean =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

export interface ShareIconButtonProps {
  onClick: () => void;
  'aria-label': string;
}

export const ShareIconButton = ({
  onClick,
  'aria-label': ariaLabel,
}: ShareIconButtonProps): ReactElement => (
  <button
    type="button"
    className="share-icon-button"
    onClick={onClick}
    aria-label={ariaLabel}
  >
    {isApplePlatform ? (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line
          x1="8.59"
          y1="13.51"
          x2="15.42"
          y2="17.49"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="15.41"
          y1="6.51"
          x2="8.59"
          y2="10.49"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    )}
  </button>
);
