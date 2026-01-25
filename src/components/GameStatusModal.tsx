import type { ReactElement } from 'react';
import { Button } from './Button';
import './GameStatusModal.scss';

export interface GameStatusModalProps {
  /** Whether the player won */
  won: boolean;
  /** The answer word (shown on loss) */
  answer: string;
  /** The next game number */
  nextGameNumber: number;
  /** Handler for play again button */
  onPlayAgain: () => void;
}

export const GameStatusModal = ({
  won,
  answer,
  nextGameNumber,
  onPlayAgain,
}: GameStatusModalProps): ReactElement => {
  return (
    <div className="game-status-modal">
      <div className="game-status-modal__content">
        <p className="game-status-modal__message">
          {won ? 'You won!' : `The word was: ${answer}`}
        </p>
        <Button size="s" onClick={onPlayAgain}>
          Play Again (Game {nextGameNumber})
        </Button>
      </div>
    </div>
  );
};
