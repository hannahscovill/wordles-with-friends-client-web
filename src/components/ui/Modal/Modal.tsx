import {
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import './Modal.scss';

export interface ModalProps {
  /** Content to display inside the modal */
  children: ReactNode;
}

const FOCUSABLE_SELECTOR: string =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Modal = ({ children }: ModalProps): ReactElement => {
  const modalRef: RefObject<HTMLDivElement | null> =
    useRef<HTMLDivElement>(null);
  const previouslyFocusedElement: RefObject<HTMLElement | null> =
    useRef<HTMLElement | null>(null);

  useEffect((): (() => void) => {
    // Save the currently focused element to restore later
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the modal
    const modal: HTMLDivElement | null = modalRef.current;
    if (modal) {
      const firstFocusable: HTMLElement | null =
        modal.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      firstFocusable?.focus();
    }

    // Restore focus when modal unmounts
    return (): void => {
      previouslyFocusedElement.current?.focus();
    };
  }, []);

  useEffect((): (() => void) => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return;

      const modal: HTMLDivElement | null = modalRef.current;
      if (!modal) return;

      const focusableElements: NodeListOf<HTMLElement> =
        modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusableElements.length === 0) return;

      const firstElement: HTMLElement = focusableElements[0];
      const lastElement: HTMLElement =
        focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return (): void => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal__content" ref={modalRef}>
        {children}
      </div>
    </div>
  );
};
