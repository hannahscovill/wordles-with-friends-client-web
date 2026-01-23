import type { ReactElement } from 'react';
import { GuessWord, GuessWordEmpty, type GuessWordProps } from './GuessWord';
import './GameBoard.scss';

const TOTAL_ROWS: number = 6;

export interface GameBoardProps {
  /** Array of up to 6 GuessWord configurations */
  guesses: GuessWordProps[];
}

export const GameBoard = ({ guesses }: GameBoardProps): ReactElement => {
  return (
    <div className="game-board">
      {Array.from({ length: TOTAL_ROWS }, (_, index) =>
        guesses[index] ? (
          <GuessWord key={index} {...guesses[index]} />
        ) : (
          <GuessWordEmpty key={index} />
        ),
      )}
    </div>
  );
};
