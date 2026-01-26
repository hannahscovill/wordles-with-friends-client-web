import type { ReactElement } from 'react';
import './Spinner.scss';

export type SpinnerSize = 'small' | 'medium' | 'large';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Accessible label for screen readers */
  label?: string;
}

export const Spinner = ({
  size = 'medium',
  label = 'Loading',
}: SpinnerProps): ReactElement => {
  return (
    <span
      className={`spinner spinner--${size}`}
      role="status"
      aria-label={label}
    />
  );
};
