import type { ReactElement, ReactNode } from 'react';
import './Modal.scss';

export interface ModalProps {
  /** Content to display inside the modal */
  children: ReactNode;
}

export const Modal = ({ children }: ModalProps): ReactElement => {
  return (
    <div className="modal">
      <div className="modal__content">{children}</div>
    </div>
  );
};
