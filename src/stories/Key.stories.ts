import type { Meta, StoryObj } from '@storybook/react';

import { fn } from 'storybook/test';

import { Key } from './Key';

const meta: Meta<typeof Key> = {
  title: 'Keyboard/Key',
  component: Key,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Unused: Story = {
  args: {
    label: 'A',
    state: 'unused',
  },
};

export const Wrong: Story = {
  args: {
    label: 'X',
    state: 'wrong',
  },
};

export const Contained: Story = {
  args: {
    label: 'E',
    state: 'contained',
  },
};

export const Correct: Story = {
  args: {
    label: 'S',
    state: 'correct',
  },
};

export const EnterKey: Story = {
  args: {
    label: 'Enter',
    keyCategory: 'special',
    state: 'unused',
  },
};

export const EnterKeyWide: Story = {
  args: {
    label: 'Enter',
    keyCategory: 'special',
    state: 'unused',
    wide: true,
  },
};

export const BackspaceKey: Story = {
  args: {
    label: 'Back',
    keyCategory: 'special',
    state: 'unused',
  },
};

export const BackspaceKeyWide: Story = {
  args: {
    label: 'Back',
    keyCategory: 'special',
    state: 'unused',
    wide: true,
  },
};
