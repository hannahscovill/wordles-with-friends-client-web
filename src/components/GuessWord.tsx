import type { ReactElement } from 'react';
import { GuessLetter, type GuessLetterProps } from './GuessLetter';
import './GuessWord.scss';

export interface GuessWordProps {
  /** Array of 5 GuessLetter configurations */
  boxes: [
    GuessLetterProps,
    GuessLetterProps,
    GuessLetterProps,
    GuessLetterProps,
    GuessLetterProps,
  ];
  /** Whether to show shake animation */
  shake?: boolean;
}

export const GuessWord = ({ boxes, shake }: GuessWordProps): ReactElement => {
  return (
    <div className={`guess-word${shake ? ' guess-word--shake' : ''}`}>
      {boxes.map((boxProps, index) => (
        <GuessLetter key={index} {...boxProps} />
      ))}
    </div>
  );
};

export const GuessWordEmpty = (): ReactElement => {
  return (
    <div className="guess-word">
      {Array.from({ length: 5 }, (_, index) => (
        <GuessLetter
          key={index}
          letter=""
          letter_contained_in_answer={false}
          correct_letter_and_position={false}
        />
      ))}
    </div>
  );
};
