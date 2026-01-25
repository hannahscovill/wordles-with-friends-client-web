import {
  useState,
  useRef,
  useEffect,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import './Popover.scss';

export interface PopoverProps {
  /** The element that triggers the popover */
  trigger: ReactNode;
  /** Content to display in the popover */
  children: ReactNode;
  /** Horizontal alignment of the popover relative to trigger */
  align?: 'left' | 'right';
}

export const Popover = ({
  trigger,
  children,
  align = 'right',
}: PopoverProps): ReactElement => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const contentRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect((): (() => void) => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleMouseEnter = (): void => {
    setIsOpen(true);
  };

  const handleMouseLeave = (): void => {
    setIsOpen(false);
  };

  const handleFocus = (): void => {
    setIsOpen(true);
  };

  const handleBlur = (event: React.FocusEvent): void => {
    // Only close if focus is leaving the entire container
    if (!containerRef.current?.contains(event.relatedTarget as Node)) {
      setIsOpen(false);
    }
  };

  const handleTriggerClick = (): void => {
    // Toggle on click for touch devices
    setIsOpen((prev: boolean): boolean => !prev);
  };

  // Clone trigger to add click handler
  const triggerElement: ReactNode = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<{ onClick?: () => void }>, {
        onClick: handleTriggerClick,
      })
    : trigger;

  return (
    <div
      className="popover"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="popover__trigger">{triggerElement}</div>
      <div
        className={`popover__content popover__content--${align} ${isOpen ? 'popover__content--open' : ''}`}
        ref={contentRef}
        role="menu"
      >
        {children}
      </div>
    </div>
  );
};
