import type { ReactElement } from 'react';
import { GameBoard } from '../components/GameBoard';
import { GameStatusModal } from '../components/GameStatusModal';
import { Keyboard } from '../components/Keyboard';
import { useGame } from '../hooks/useGame';
import './HomePage.scss';

export const HomePage = (): ReactElement => {
  const {
    guesses,
    keyStates,
    status,
    answer,
    onKeyPress,
    onEnter,
    onBackspace,
    onNewGame,
  } = useGame();

  return (
    <div className="home-page">
      {status !== 'playing' && (
        <GameStatusModal
          won={status === 'won'}
          answer={answer}
          onPlayAgain={onNewGame}
        />
      )}
      <GameBoard guesses={guesses} />
      <Keyboard
        keyStates={keyStates}
        onKeyPress={onKeyPress}
        onEnter={onEnter}
        onBackspace={onBackspace}
      />
    </div>
  );
};
