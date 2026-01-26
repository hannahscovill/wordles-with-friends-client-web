import type { ReactElement, InputHTMLAttributes } from 'react';
import './Input.scss';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className'
> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display below input */
  error?: string;
  /** Full width of container */
  fullWidth?: boolean;
}

export const Input = ({
  label,
  error,
  fullWidth = false,
  id,
  ...rest
}: InputProps): ReactElement => {
  const inputId: string | undefined =
    id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div
      className={`input-wrapper ${fullWidth ? 'input-wrapper--full-width' : ''}`}
    >
      {label && (
        <label htmlFor={inputId} className="input-wrapper__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-wrapper__input ${error ? 'input-wrapper__input--error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <span id={`${inputId}-error`} className="input-wrapper__error">
          {error}
        </span>
      )}
    </div>
  );
};
