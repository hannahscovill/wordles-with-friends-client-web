import type { Meta, StoryObj } from '@storybook/react';

import { GameBoard } from './GameBoard';
import { type GuessWordProps } from './GuessWord';

const meta: Meta<typeof GameBoard> = {
  title: 'Game/GameBoard',
  component: GameBoard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const emptyGuess: GuessWordProps = {
  boxes: [
    {
      letter: '',
      letter_contained_in_answer: false,
      correct_letter_and_position: false,
    },
    {
      letter: '',
      letter_contained_in_answer: false,
      correct_letter_and_position: false,
    },
    {
      letter: '',
      letter_contained_in_answer: false,
      correct_letter_and_position: false,
    },
    {
      letter: '',
      letter_contained_in_answer: false,
      correct_letter_and_position: false,
    },
    {
      letter: '',
      letter_contained_in_answer: false,
      correct_letter_and_position: false,
    },
  ],
};

export const Empty: Story = {
  args: {
    guesses: [
      emptyGuess,
      emptyGuess,
      emptyGuess,
      emptyGuess,
      emptyGuess,
      emptyGuess,
    ],
  },
};

export const GameInProgress: Story = {
  args: {
    guesses: [
      {
        boxes: [
          {
            letter: 'S',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'T',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'A',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'R',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'E',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
        ],
      },
      {
        boxes: [
          {
            letter: 'C',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'R',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'A',
            letter_contained_in_answer: false,
            correct_letter_and_position: true,
          },
          {
            letter: 'N',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'E',
            letter_contained_in_answer: false,
            correct_letter_and_position: true,
          },
        ],
      },
      {
        boxes: [
          {
            letter: 'G',
            letter_contained_in_answer: false,
            correct_letter_and_position: true,
          },
          {
            letter: 'R',
            letter_contained_in_answer: false,
            correct_letter_and_position: true,
          },
          {
            letter: 'A',
            letter_contained_in_answer: false,
            correct_letter_and_position: true,
          },
          {
            letter: 'P',
            letter_contained_in_answer: false,
            correct_letter_and_position: true,
          },
          {
            letter: 'E',
            letter_contained_in_answer: false,
            correct_letter_and_position: true,
          },
        ],
      },
      emptyGuess,
      emptyGuess,
      emptyGuess,
    ],
  },
};

export const GameLost: Story = {
  args: {
    guesses: [
      {
        boxes: [
          {
            letter: 'S',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'T',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'A',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'R',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'E',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
        ],
      },
      {
        boxes: [
          {
            letter: 'C',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'L',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'I',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'M',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'B',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
        ],
      },
      {
        boxes: [
          {
            letter: 'F',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'L',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'A',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'K',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'E',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
        ],
      },
      {
        boxes: [
          {
            letter: 'W',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'H',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'E',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'A',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'T',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
        ],
      },
      {
        boxes: [
          {
            letter: 'P',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'E',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'A',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'C',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'H',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
        ],
      },
      {
        boxes: [
          {
            letter: 'B',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'E',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'A',
            letter_contained_in_answer: true,
            correct_letter_and_position: false,
          },
          {
            letter: 'R',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
          {
            letter: 'D',
            letter_contained_in_answer: false,
            correct_letter_and_position: false,
          },
        ],
      },
    ],
  },
};
