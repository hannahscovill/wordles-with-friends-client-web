import type { ReactElement } from 'react';
import './Key.css';

export interface KeyProps {
  /** The label to display on the key */
  label: string;
  /** The category of key */
  keyCategory?: 'alphabet' | 'special';
  /** The state of the key based on previous guesses */
  state?: 'unused' | 'wrong' | 'contained' | 'correct';
  /** Whether this is a wide key */
  wide?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export const Key = ({
  label,
  keyCategory = 'alphabet',
  state = 'unused',
  wide = false,
  onClick,
}: KeyProps): ReactElement => {
  const stateClass: string = state !== 'unused' ? `key--${state}` : '';
  const categoryClass: string = `key--${keyCategory}`;
  const wideClass: string = wide ? 'key--wide' : '';

  return (
    <button
      type="button"
      className={`key ${categoryClass} ${stateClass} ${wideClass}`.trim()}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
