import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useLoaderData } from '@tanstack/react-router';
import { GameBoard } from '../components/GameBoard';
import { GameStatusModal } from '../components/GameStatusModal';
import { Keyboard } from '../components/Keyboard';
import { Toast } from '../components/Toast';
import { useGame } from '../hooks/useGame';
import './HomePage.scss';

function formatDateForDisplay(dateStr: string): string {
  const date: Date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface LoaderData {
  puzzleDate?: string;
}

export const HomePage = (): ReactElement => {
  // Get puzzleDate from route loader if available (puzzle route provides it)
  // Index route doesn't have loader data, so this will be undefined
  const loaderData: LoaderData | undefined = useLoaderData({
    strict: false,
  }) as LoaderData | undefined;
  const puzzleDate: string | undefined = loaderData?.puzzleDate;
  const {
    guesses,
    keyStates,
    status,
    answer,
    puzzleDate: activePuzzleDate,
    isLoading,
    invalidWord,
    error,
    completedDuringSession,
    onKeyPress,
    onEnter,
    onBackspace,
  } = useGame({ puzzleDate });

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

  return (
    <div className="home-page">
      {completedDuringSession && (
        <GameStatusModal won={status === 'won'} answer={answer} />
      )}
      <div className="home-page__game-container">
        <div className="home-page__date-title">
          {formatDateForDisplay(activePuzzleDate)}
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
