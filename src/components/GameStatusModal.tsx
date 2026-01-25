import type { ReactElement } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import './GameStatusModal.scss';

export interface GameStatusModalProps {
  /** Whether the player won */
  won: boolean;
  /** The answer word (shown on loss) */
  answer: string;
  /** Handler for play again button */
  onPlayAgain: () => void;
}

export const GameStatusModal = ({
  won,
  answer,
  onPlayAgain,
}: GameStatusModalProps): ReactElement => {
  return (
    <Modal>
      <p className="game-status-modal__message">
        {won ? 'You won!' : `The word was: ${answer}`}
      </p>
      <Button size="s" onClick={onPlayAgain}>
        Play Again
      </Button>
    </Modal>
  );
};
