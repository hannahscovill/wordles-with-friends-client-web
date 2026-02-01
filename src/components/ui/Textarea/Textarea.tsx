import type { ReactElement, TextareaHTMLAttributes } from 'react';
import './Textarea.scss';

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Error message to display below textarea */
  error?: string;
  /** Full width of container */
  fullWidth?: boolean;
}

export const Textarea = ({
  label,
  error,
  fullWidth = false,
  id,
  rows = 4,
  ...rest
}: TextareaProps): ReactElement => {
  const textareaId: string | undefined =
    id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div
      className={`textarea-wrapper ${fullWidth ? 'textarea-wrapper--full-width' : ''}`}
    >
      {label && (
        <label htmlFor={textareaId} className="textarea-wrapper__label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`textarea-wrapper__textarea ${error ? 'textarea-wrapper__textarea--error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        rows={rows}
        {...rest}
      />
      {error && (
        <span id={`${textareaId}-error`} className="textarea-wrapper__error">
          {error}
        </span>
      )}
    </div>
  );
};
