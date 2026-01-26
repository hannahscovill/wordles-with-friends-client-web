import type { ReactElement, ReactNode, ButtonHTMLAttributes } from 'react';
import './Button.scss';

export type ButtonSize = 's' | 'm' | 'l';
export type ButtonVariant = 'default' | 'onLight';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  /** The content to display inside the button (ignored if imageUrl is provided) */
  children?: ReactNode;
  /** Size of the button */
  size?: ButtonSize;
  /** Visual variant - use 'onLight' for buttons on light/white backgrounds like modals */
  variant?: ButtonVariant;
  /** URL for link buttons - renders as an anchor tag when provided */
  href?: string;
  /** Opens link in new tab (only applies when href is provided) */
  openInNewTab?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** URL for the image to display (renders image instead of children) */
  imageUrl?: string;
  /** Alt text for the image (required when imageUrl is provided) */
  imageAlt?: string;
}

export const Button = ({
  children,
  size = 'm',
  variant = 'default',
  href,
  openInNewTab = false,
  onClick,
  className = '',
  disabled = false,
  imageUrl,
  imageAlt,
  ...rest
}: ButtonProps): ReactElement => {
  const baseClass: string = 'button';
  const isImageButton: boolean = Boolean(imageUrl);
  const combinedClassName: string = [
    baseClass,
    `${baseClass}--${size}`,
    variant !== 'default' ? `${baseClass}--${variant}` : '',
    disabled ? `${baseClass}--disabled` : '',
    isImageButton ? `${baseClass}--image` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content: ReactElement = (
    <>
      <span className="button__background" aria-hidden="true" />
      {!isImageButton && (
        <span className="button__primary" aria-hidden="true" />
      )}
      <span className="button__frame">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt ?? 'Button image'}
            className="button__image"
          />
        ) : (
          children
        )}
      </span>
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
      {...rest}
    >
      {content}
    </button>
  );
};
