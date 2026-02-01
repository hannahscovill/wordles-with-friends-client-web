import type { ReactElement } from 'react';
import { Key, type KeyProps } from './Key';
import './Keyboard.scss';

export type KeyState = KeyProps['state'];

export interface KeyboardProps {
  /** Map of letter to its state based on previous guesses */
  keyStates?: Record<string, KeyState>;
  /** Handler called when a letter key is pressed */
  onKeyPress?: (key: string) => void;
  /** Handler called when Enter is pressed */
  onEnter?: () => void;
  /** Handler called when Backspace is pressed */
  onBackspace?: () => void;
}

const KEYBOARD_ROWS: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const Keyboard = ({
  keyStates = {},
  onKeyPress,
  onEnter,
  onBackspace,
}: KeyboardProps): ReactElement => {
  const getKeyState = (letter: string): KeyState => {
    return keyStates[letter] ?? 'unused';
  };

  return (
    <div className="keyboard-wrapper">
      <div className="keyboard">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard__row">
            {rowIndex === 2 && (
              <Key
                label="Delete"
                keyCategory="special"
                wide
                onClick={onBackspace}
              />
            )}
            {row.map((letter) => (
              <Key
                key={letter}
                label={letter}
                state={getKeyState(letter)}
                onClick={() => onKeyPress?.(letter)}
              />
            ))}
            {rowIndex === 2 && (
              <Key label="Enter" keyCategory="enter" wide onClick={onEnter} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
