import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { Button, Modal } from './ui';
import './GameStatusModal.scss';

export interface GameStatusModalProps {
  /** Whether the player won */
  won: boolean;
  /** The answer word (shown on loss) */
  answer: string;
}

export const GameStatusModal = ({
  won,
  answer,
}: GameStatusModalProps): ReactElement => {
  return (
    <Modal>
      <p className="game-status-modal__message">
        {won ? 'You won!' : `The word was: ${answer}`}
      </p>
      <Link to="/history">
        <Button size="s" variant="onLight">
          Play Other Games
        </Button>
      </Link>
    </Modal>
  );
};
