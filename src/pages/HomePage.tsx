import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useSearch } from '@tanstack/react-router';
import { GameBoard } from '../components/GameBoard';
import { GameStatusModal } from '../components/GameStatusModal';
import { Keyboard } from '../components/Keyboard';
import { Toast } from '../components/Toast';
import { useGame } from '../hooks/useGame';
import './HomePage.scss';

function formatDateForDisplay(dateStr: string): string {
  const date: Date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export const HomePage = (): ReactElement => {
  const { date } = useSearch({ from: '/' });
  const {
    guesses,
    keyStates,
    status,
    answer,
    puzzleDate,
    invalidWord,
    error,
    onKeyPress,
    onEnter,
    onBackspace,
  } = useGame(date);

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

  return (
    <div className="home-page">
      {status !== 'playing' && (
        <GameStatusModal won={status === 'won'} answer={answer} />
      )}
      <div className="home-page__game-container">
        {date && (
          <div className="home-page__date-header">
            {formatDateForDisplay(puzzleDate)}
          </div>
        )}
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
