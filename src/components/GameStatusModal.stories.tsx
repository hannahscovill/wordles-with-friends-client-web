import type { Meta, StoryObj } from '@storybook/react';
import { GameStatusModal } from './GameStatusModal';

const meta: Meta<typeof GameStatusModal> = {
  title: 'Components/GameStatusModal',
  component: GameStatusModal,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onPlayAgain: { action: 'play again clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Won: Story = {
  args: {
    won: true,
    answer: 'CRANE',
  },
};

export const Lost: Story = {
  args: {
    won: false,
    answer: 'CRANE',
  },
};
