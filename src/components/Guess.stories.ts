import type { Meta, StoryObj } from '@storybook/react';

import { Guess } from './Guess';

const meta: Meta<typeof Guess> = {
  title: 'Game/Guess',
  component: Guess,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
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
  },
};

export const PartialGuess: Story = {
  args: {
    boxes: [
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
        letter: 'L',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      },
      {
        letter: 'L',
        letter_contained_in_answer: false,
        correct_letter_and_position: true,
      },
      {
        letter: 'O',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      },
    ],
  },
};

export const AllCorrect: Story = {
  args: {
    boxes: [
      {
        letter: 'W',
        letter_contained_in_answer: false,
        correct_letter_and_position: true,
      },
      {
        letter: 'O',
        letter_contained_in_answer: false,
        correct_letter_and_position: true,
      },
      {
        letter: 'R',
        letter_contained_in_answer: false,
        correct_letter_and_position: true,
      },
      {
        letter: 'D',
        letter_contained_in_answer: false,
        correct_letter_and_position: true,
      },
      {
        letter: 'S',
        letter_contained_in_answer: false,
        correct_letter_and_position: true,
      },
    ],
  },
};

export const AllWrong: Story = {
  args: {
    boxes: [
      {
        letter: 'X',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      },
      {
        letter: 'Y',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      },
      {
        letter: 'Z',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      },
      {
        letter: 'Q',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      },
      {
        letter: 'J',
        letter_contained_in_answer: false,
        correct_letter_and_position: false,
      },
    ],
  },
};
