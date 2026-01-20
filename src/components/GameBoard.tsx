import type { ReactElement } from 'react';
import { Guess, type GuessProps } from './Guess';
import './GameBoard.css';

export interface GameBoardProps {
  /** Array of 6 Guess configurations */
  guesses: [
    GuessProps,
    GuessProps,
    GuessProps,
    GuessProps,
    GuessProps,
    GuessProps,
  ];
}

export const GameBoard = ({ guesses }: GameBoardProps): ReactElement => {
  return (
    <div className="game-board">
      {guesses.map((guessProps, index) => (
        <Guess key={index} {...guessProps} />
      ))}
    </div>
  );
};
