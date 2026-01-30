import { useState, useEffect, useCallback, type ReactElement } from 'react';
import { GameBoard } from '../components/GameBoard';
import { GameStatusModal } from '../components/GameStatusModal';
import { Keyboard } from '../components/Keyboard';
import { Toast } from '../components/Toast';
import { useGame } from '../hooks/useGame';
import './HomePage.scss';

export const HomePage = (): ReactElement => {
  const {
    guesses,
    keyStates,
    status,
    answer,
    invalidWord,
    onKeyPress,
    onEnter,
    onBackspace,
    onNewGame,
  } = useGame();

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
        <GameStatusModal
          won={status === 'won'}
          answer={answer}
          onPlayAgain={onNewGame}
        />
      )}
      <div className="home-page__game-container">
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
