import type { ReactElement } from 'react';
import './GuessBox.scss';

export interface GuessBoxProps {
  /** The letter to display */
  letter: string;
  /** Whether the letter is contained in the answer (but not in correct position) */
  letter_contained_in_answer: boolean;
  /** Whether the letter is in the correct position */
  correct_letter_and_position: boolean;
}

export const GuessBox = ({
  letter,
  letter_contained_in_answer,
  correct_letter_and_position,
}: GuessBoxProps): ReactElement => {
  let stateClass: string = '';

  if (correct_letter_and_position) {
    stateClass = 'guess-box--correct';
  } else if (letter_contained_in_answer) {
    stateClass = 'guess-box--contained';
  } else if (letter) {
    stateClass = 'guess-box--wrong';
  }

  return <div className={`guess-box ${stateClass}`.trim()}>{letter}</div>;
};
