import type { ReactElement, ReactNode } from 'react';
import './OptionToggle.scss';

export interface OptionToggleProps {
  /** Whether this option is currently selected */
  selected: boolean;
  /** Called when the option is clicked */
  onClick: () => void;
  /** Option label content */
  children: ReactNode;
  /** Optional leading emoji */
  emoji?: string;
}

/**
 * A single button in an option group (radio-like or multi-select).
 * Selection styling only — the parent owns whether clicking one option
 * deselects the others (radio) or toggles independently (multi-select).
 */
export const OptionToggle = ({
  selected,
  onClick,
  children,
  emoji,
}: OptionToggleProps): ReactElement => {
  return (
    <button
      type="button"
      className={`option-toggle ${selected ? 'option-toggle--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      {emoji && <span className="option-toggle__emoji">{emoji}</span>}
      {children}
    </button>
  );
};

export interface OptionToggleGroupProps {
  children: ReactNode;
  'aria-label': string;
  /** Highlights every option's border to flag a validation error */
  error?: boolean;
}

/** Layout wrapper for a row of OptionToggle buttons. */
export const OptionToggleGroup = ({
  children,
  'aria-label': ariaLabel,
  error = false,
}: OptionToggleGroupProps): ReactElement => {
  return (
    <div
      className={`option-toggle-group ${error ? 'option-toggle-group--error' : ''}`}
      role="group"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};
