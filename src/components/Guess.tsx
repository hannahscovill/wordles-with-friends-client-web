import type { ReactElement } from 'react';
import { GuessBox, type GuessBoxProps } from './GuessBox';
import './Guess.scss';

export interface GuessProps {
  /** Array of 5 GuessBox configurations */
  boxes: [
    GuessBoxProps,
    GuessBoxProps,
    GuessBoxProps,
    GuessBoxProps,
    GuessBoxProps,
  ];
}

export const Guess = ({ boxes }: GuessProps): ReactElement => {
  return (
    <div className="guess">
      {boxes.map((boxProps, index) => (
        <GuessBox key={index} {...boxProps} />
      ))}
    </div>
  );
};
