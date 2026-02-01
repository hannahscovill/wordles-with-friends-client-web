import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { useParams } from '@tanstack/react-router';
import { GameBoard } from '../components/GameBoard';
import { GameStatusModal } from '../components/GameStatusModal';
import { Keyboard } from '../components/Keyboard';
import { Toast } from '../components/Toast';
import { useGame } from '../hooks/useGame';
import './HomePage.scss';

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
    onKeyPress,
    onEnter,
    onBackspace,
    onNewGame,
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

  return (
    <div className="home-page">
      {status !== 'playing' && (
        <GameStatusModal
          won={status === 'won'}
          answer={answer}
          onPlayAgain={onNewGame}
        />
      )}
      <div className="home-page__game-container">
        <div className="home-page__puzzle-date">{puzzleDate}</div>
        <GameBoard guesses={guesses} />
        <Toast
          message="Not in word list"
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
