import { useState, useCallback, type ReactElement } from 'react';
import { useNavigate, type NavigateFn } from '@tanstack/react-router';
import type { GuessLetterProps } from './GuessLetter';
import type { LetterGrade } from '../api/types';
import { ShareIconButton } from './ShareIconButton';
import { Toast } from './Toast';
import { Button, Modal } from './ui';
import { MobileAppSignup } from './MobileAppSignup';
import { generateShareText, shareResult } from '../utils/share';
import { useLocalStorage } from '../hooks/useLocalStorage';
import './GameStatusModal.scss';

const MOBILE_PROMO_DISMISSED_KEY: string = 'mobile_app_promo_dismissed';

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

function toGrade(tile: GuessLetterProps): LetterGrade {
  if (tile.correct_letter_and_position) return 'correct';
  if (tile.letter_contained_in_answer) return 'contained';
  return 'wrong';
}

export const GameStatusModal = ({
  won,
  answer,
  guesses,
  puzzleDate,
}: GameStatusModalProps): ReactElement => {
  const navigate: NavigateFn = useNavigate();
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);
  const [isPromoDismissed, setIsPromoDismissed] = useLocalStorage<boolean>(
    MOBILE_PROMO_DISMISSED_KEY,
    false,
  );

  const handlePlayOtherGames = (): void => {
    navigate({ to: '/history' });
  };

  const handleShare: () => Promise<void> =
    useCallback(async (): Promise<void> => {
      const grades: LetterGrade[][] = guesses.map(
        (row: GuessLetterProps[]): LetterGrade[] => row.map(toGrade),
      );
      const text: string = generateShareText(grades, puzzleDate, won);
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
      <ShareIconButton
        onClick={handleShare}
        aria-label={`Share result for ${puzzleDate}`}
      />
      <Button size="s" variant="onLight" onClick={handlePlayOtherGames}>
        Play Other Games
      </Button>
      {!isPromoDismissed && (
        <MobileAppSignup
          source="game_status_modal"
          onDismiss={() => setIsPromoDismissed(true)}
          onSuccess={() => setIsPromoDismissed(true)}
        />
      )}
      <Toast
        message="Copied to clipboard!"
        visible={showCopiedToast}
        onHide={hideCopiedToast}
      />
    </Modal>
  );
};
