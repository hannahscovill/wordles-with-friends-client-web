import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onEditClick: { action: 'edit clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAvatarUrl: string = 'https://www.gravatar.com/avatar/?d=mp';

export const Small: Story = {
  args: {
    src: sampleAvatarUrl,
    alt: 'User avatar',
    size: 's',
  },
};

export const Medium: Story = {
  args: {
    src: sampleAvatarUrl,
    alt: 'User avatar',
    size: 'm',
  },
};

export const Large: Story = {
  args: {
    src: sampleAvatarUrl,
    alt: 'User avatar',
    size: 'l',
  },
};

export const Editable: Story = {
  args: {
    src: sampleAvatarUrl,
    alt: 'User avatar',
    size: 'l',
    editable: true,
  },
};

export const WithFallback: Story = {
  args: {
    src: 'https://broken-image-url.invalid/avatar.jpg',
    alt: 'User avatar with fallback',
    size: 'l',
  },
};
