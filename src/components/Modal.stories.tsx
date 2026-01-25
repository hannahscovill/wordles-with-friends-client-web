import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p style={{ margin: 0 }}>This is modal content</p>,
  },
};

export const WithMultipleElements: Story = {
  args: {
    children: (
      <>
        <h2 style={{ margin: 0 }}>Modal Title</h2>
        <p style={{ margin: 0 }}>Some descriptive text goes here.</p>
        <button type="button">Action Button</button>
      </>
    ),
  },
};
