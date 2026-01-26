import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Display Name',
    placeholder: 'Enter your name',
  },
};

export const WithError: Story = {
  args: {
    label: 'Display Name',
    value: 'A very long name that exceeds the maximum allowed characters',
    error: 'Name must be 100 characters or less',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    value: 'user@example.com',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'This input takes full width',
    fullWidth: true,
  },
  decorators: [
    (Story): ReactElement => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};
