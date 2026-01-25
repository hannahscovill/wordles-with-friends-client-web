import type { Meta, StoryObj } from '@storybook/react';

import { fn } from 'storybook/test';

import { Keyboard } from './Keyboard';

const meta: Meta<typeof Keyboard> = {
  title: 'Keyboard/Keyboard',
  component: Keyboard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onKeyPress: fn(),
    onEnter: fn(),
    onBackspace: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithKeyStates: Story = {
  args: {
    keyStates: {
      S: 'correct',
      T: 'correct',
      A: 'contained',
      R: 'contained',
      E: 'wrong',
      L: 'wrong',
      I: 'wrong',
      N: 'wrong',
    },
  },
};

export const AllCorrect: Story = {
  args: {
    keyStates: {
      Q: 'correct',
      W: 'correct',
      E: 'correct',
      R: 'correct',
      T: 'correct',
      Y: 'correct',
      U: 'correct',
      I: 'correct',
      O: 'correct',
      P: 'correct',
      A: 'correct',
      S: 'correct',
      D: 'correct',
      F: 'correct',
      G: 'correct',
      H: 'correct',
      J: 'correct',
      K: 'correct',
      L: 'correct',
      Z: 'correct',
      X: 'correct',
      C: 'correct',
      V: 'correct',
      B: 'correct',
      N: 'correct',
      M: 'correct',
    },
  },
};

export const MixedStates: Story = {
  args: {
    keyStates: {
      W: 'correct',
      O: 'correct',
      R: 'correct',
      D: 'correct',
      L: 'correct',
      E: 'contained',
      A: 'contained',
      S: 'wrong',
      T: 'wrong',
      I: 'wrong',
      N: 'wrong',
      G: 'wrong',
    },
  },
};
