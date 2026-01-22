import type { ReactElement, ReactNode } from 'react';
import './Button.scss';

export type ButtonSize = 's' | 'm' | 'l';

export interface ButtonProps {
  /** The content to display inside the button */
  children: ReactNode;
  /** Size of the button */
  size?: ButtonSize;
  /** URL for link buttons - renders as an anchor tag when provided */
  href?: string;
  /** Opens link in new tab (only applies when href is provided) */
  openInNewTab?: boolean;
  /** Click handler (only applies when href is not provided) */
  onClick?: () => void;
  /** Additional CSS class name */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const Button = ({
  children,
  size = 'm',
  href,
  openInNewTab = false,
  onClick,
  className = '',
  disabled = false,
}: ButtonProps): ReactElement => {
  const baseClass: string = 'button';
  const combinedClassName: string =
    `${baseClass} ${baseClass}--${size} ${disabled ? `${baseClass}--disabled` : ''} ${className}`.trim();

  const content: ReactElement = (
    <>
      <span className="button__shadow" aria-hidden="true" />
      <span className="button__background" aria-hidden="true" />
      <span className="button__label">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={combinedClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {content}
    </button>
  );
};
