import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useParams } from '@tanstack/react-router';
import { GameBoard } from '../components/GameBoard';
import { GameStatusModal } from '../components/GameStatusModal';
import { Keyboard } from '../components/Keyboard';
import { Toast } from '../components/Toast';
import { useGame } from '../hooks/useGame';
import './HomePage.scss';

interface FormattedDate {
  weekday: string;
  monthDay: string;
  year: string;
}

function formatDateForDisplay(dateStr: string): FormattedDate {
  const date: Date = new Date(dateStr + 'T00:00:00');
  return {
    weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
    monthDay: date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
    }),
    year: date.toLocaleDateString('en-US', { year: 'numeric' }),
  };
}

export const HomePage = (): ReactElement => {
  const params: { puzzleDate?: string } = useParams({ strict: false }) as {
    puzzleDate?: string;
  };
  const urlPuzzleDate: string | undefined = params.puzzleDate;

  const {
    guesses,
    keyStates,
    status,
    answer,
    puzzleDate,
    isLoading,
    invalidWord,
    error,
    completedDuringSession,
    onKeyPress,
    onEnter,
    onBackspace,
  } = useGame({ puzzleDate: urlPuzzleDate });

  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    if (invalidWord) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
        setShowToast(true);
      }, 0);
      return (): void => clearTimeout(timer);
    }
    return undefined;
  }, [invalidWord]);

  const hideToast: () => void = useCallback((): void => {
    setShowToast(false);
  }, []);

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-page__loading">Loading...</div>
      </div>
    );
  }

  const formattedDate: FormattedDate = formatDateForDisplay(puzzleDate);

  return (
    <div className="home-page">
      {completedDuringSession && (
        <GameStatusModal won={status === 'won'} answer={answer} />
      )}
      <div className="home-page__game-container">
        <div className="home-page__date-title">
          <span className="home-page__date-weekday">
            {formattedDate.weekday}
          </span>
          <span className="home-page__date-month-day">
            {formattedDate.monthDay}
          </span>
          <span className="home-page__date-year">{formattedDate.year}</span>
        </div>
        <GameBoard guesses={guesses} />
        <Toast
          message={error?.message ?? 'Invalid guess'}
          visible={showToast}
          onHide={hideToast}
        />
      </div>
      <Keyboard
        keyStates={keyStates}
        onKeyPress={onKeyPress}
        onEnter={onEnter}
        onBackspace={onBackspace}
      />
    </div>
  );
};
