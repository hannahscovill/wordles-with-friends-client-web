import type { ReactElement } from 'react';
import { useNavigate, type NavigateFn } from '@tanstack/react-router';
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
  const navigate: NavigateFn = useNavigate();

  const handlePlayOtherGames = (): void => {
    navigate({ to: '/history' });
  };

  return (
    <Modal>
      <p className="game-status-modal__message">
        {won ? 'You won!' : `The word was: ${answer}`}
      </p>
      <Button size="s" variant="onLight" onClick={handlePlayOtherGames}>
        Play Other Games
      </Button>
    </Modal>
  );
};
