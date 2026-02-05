import type { ReactElement } from 'react';
import type { GradedMove } from '../api';
import './MiniGameBoard.scss';

export interface MiniGameBoardProps {
  guesses: GradedMove[];
  won?: boolean;
}

export const MiniGameBoard = ({
  guesses,
  won,
}: MiniGameBoardProps): ReactElement => {
  return (
    <div className="mini-game-board">
      {guesses.map((guess: GradedMove, rowIndex: number) => (
        <div key={rowIndex} className="mini-game-board__row">
          {guess.map((letter, letterIndex: number) => {
            let stateClass: string = 'mini-game-board__tile--wrong';

            if (letter.grade === 'correct') {
              stateClass = 'mini-game-board__tile--correct';
            } else if (letter.grade === 'contained') {
              stateClass = 'mini-game-board__tile--contained';
            }

            return (
              <div
                key={letterIndex}
                className={`mini-game-board__tile ${stateClass}`}
                aria-label={`${letter.letter}: ${letter.grade}`}
              />
            );
          })}
        </div>
      ))}
      {won !== undefined && (
        <div
          className={`mini-game-board__status ${won ? 'mini-game-board__status--won' : 'mini-game-board__status--lost'}`}
        >
          {won ? '🎉' : '😔'}
        </div>
      )}
    </div>
  );
};
