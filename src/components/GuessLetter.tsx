import type { ReactElement } from 'react';
import './GuessLetter.scss';

export interface GuessLetterProps {
  /** The letter to display */
  letter: string;
  /** Whether the letter is contained in the answer (but not in correct position) */
  letter_contained_in_answer: boolean;
  /** Whether the letter is in the correct position */
  correct_letter_and_position: boolean;
}

export const GuessLetter = ({
  letter,
  letter_contained_in_answer,
  correct_letter_and_position,
}: GuessLetterProps): ReactElement => {
  let stateClass: string = '';

  if (correct_letter_and_position) {
    stateClass = 'guess-letter--correct';
  } else if (letter_contained_in_answer) {
    stateClass = 'guess-letter--contained';
  } else if (letter) {
    stateClass = 'guess-letter--wrong';
  }

  return <div className={`guess-letter ${stateClass}`.trim()}>{letter}</div>;
};
