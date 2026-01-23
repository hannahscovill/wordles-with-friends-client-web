import type { Meta, StoryObj } from '@storybook/react';

import { GuessLetter } from './GuessLetter';

const meta: Meta<typeof GuessLetter> = {
  title: 'Game/GuessLetter',
  component: GuessLetter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    letter: '',
    letter_contained_in_answer: false,
    correct_letter_and_position: false,
  },
};

export const WrongLetter: Story = {
  args: {
    letter: 'X',
    letter_contained_in_answer: false,
    correct_letter_and_position: false,
  },
};

export const ContainedLetter: Story = {
  args: {
    letter: 'A',
    letter_contained_in_answer: true,
    correct_letter_and_position: false,
  },
};

export const CorrectLetter: Story = {
  args: {
    letter: 'E',
    letter_contained_in_answer: false,
    correct_letter_and_position: true,
  },
};
