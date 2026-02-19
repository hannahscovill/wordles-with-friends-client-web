import { useState, useCallback, type ReactElement } from 'react';
import { useNavigate, type NavigateFn } from '@tanstack/react-router';
import type { GuessLetterProps } from './GuessLetter';
import { Toast } from './Toast';
import { Button, Modal } from './ui';
import { generateShareText, shareResult } from '../utils/share';
import './GameStatusModal.scss';

export interface GameStatusModalProps {
  /** Whether the player won */
  won: boolean;
  /** The answer word (shown on loss) */
  answer: string | undefined;
  /** Completed guesses (each row is an array of GuessLetterProps) */
  guesses: GuessLetterProps[][];
  /** The active puzzle date string, e.g. "2026-02-18" */
  puzzleDate: string;
}

export const GameStatusModal = ({
  won,
  answer,
  guesses,
  puzzleDate,
}: GameStatusModalProps): ReactElement => {
  const navigate: NavigateFn = useNavigate();
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);

  const handlePlayOtherGames = (): void => {
    navigate({ to: '/history' });
  };

  const handleShare: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      const text: string = generateShareText(guesses, puzzleDate, won);
      const { method } = await shareResult(text);
      if (method === 'copied') {
        setShowCopiedToast(true);
      }
    }, [guesses, puzzleDate, won]);

  const hideCopiedToast: () => void = useCallback((): void => {
    setShowCopiedToast(false);
  }, []);

  return (
    <Modal>
      <p className="game-status-modal__message">
        {won ? 'You won!' : answer ? `The word was: ${answer}` : 'Game over'}
      </p>
      <Button size="s" variant="onLight" onClick={handleShare}>
        Share
      </Button>
      <Button size="s" variant="onLight" onClick={handlePlayOtherGames}>
        Play Other Games
      </Button>
      <Toast
        message="Copied to clipboard!"
        visible={showCopiedToast}
        onHide={hideCopiedToast}
      />
    </Modal>
  );
};
