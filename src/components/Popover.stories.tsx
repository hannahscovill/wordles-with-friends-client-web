import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <button type="button">Hover me</button>,
    children: (
      <div style={{ padding: '12px 16px' }}>
        <p style={{ margin: 0 }}>Popover content goes here</p>
      </div>
    ),
  },
};

export const WithMenu: Story = {
  args: {
    trigger: <button type="button">Menu</button>,
    children: (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <li>
          <button
            type="button"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              borderBottom: '2px solid #000',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            Option 1
          </button>
        </li>
        <li>
          <button
            type="button"
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            Option 2
          </button>
        </li>
      </ul>
    ),
  },
};

export const AlignLeft: Story = {
  args: {
    trigger: <button type="button">Left aligned</button>,
    align: 'left',
    children: (
      <div style={{ padding: '12px 16px' }}>
        <p style={{ margin: 0 }}>This popover is left-aligned</p>
      </div>
    ),
  },
};

export const InContext: Story = {
  args: {
    trigger: <button type="button">Open menu</button>,
    children: (
      <div style={{ padding: '12px 16px' }}>
        <p style={{ margin: 0 }}>Menu content</p>
      </div>
    ),
  },
  decorators: [
    (Story): ReactElement => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          width: '400px',
          padding: '1rem',
          background: '#e8e9de',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
