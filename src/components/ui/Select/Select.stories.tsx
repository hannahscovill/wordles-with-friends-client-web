import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      { value: '7', label: '7 items' },
      { value: '14', label: '14 items' },
      { value: '30', label: '30 items' },
      { value: '50', label: '50 items' },
    ],
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Page Size',
    options: [
      { value: '7', label: '7 items' },
      { value: '14', label: '14 items' },
      { value: '30', label: '30 items' },
      { value: '50', label: '50 items' },
    ],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Page Size',
    options: [
      { value: '7', label: '7 items' },
      { value: '14', label: '14 items' },
    ],
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Select an Option',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
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
