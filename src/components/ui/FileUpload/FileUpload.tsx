import {
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import './FileUpload.scss';

export interface FileUploadProps {
  /** Accepted file types (e.g., "image/*") */
  accept?: string;
  /** Callback when file is selected */
  onFileSelect: (file: File) => void;
  /** Custom trigger element (renders children as clickable trigger) */
  children: ReactNode;
  /** Disable the upload */
  disabled?: boolean;
}

export const FileUpload = ({
  accept,
  onFileSelect,
  children,
  disabled = false,
}: FileUploadProps): ReactElement => {
  const inputRef: RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement>(null);

  const handleClick = (): void => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file: File | undefined = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input so same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <div
      className={`file-upload ${disabled ? 'file-upload--disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="file-upload__input"
        aria-hidden="true"
        tabIndex={-1}
      />
      {children}
    </div>
  );
};
