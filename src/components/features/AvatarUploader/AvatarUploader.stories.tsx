import type { Meta, StoryObj } from '@storybook/react';
import { AvatarUploader } from './AvatarUploader';

const meta: Meta<typeof AvatarUploader> = {
  title: 'Features/AvatarUploader',
  component: AvatarUploader,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onImageSelect: { action: 'image selected' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleAvatarUrl: string = 'https://www.gravatar.com/avatar/?d=mp';

export const Default: Story = {
  args: {
    currentSrc: sampleAvatarUrl,
    alt: 'User avatar',
    size: 'l',
  },
};

export const Uploading: Story = {
  args: {
    currentSrc: sampleAvatarUrl,
    alt: 'User avatar',
    size: 'l',
    isUploading: true,
  },
};

export const SmallSize: Story = {
  args: {
    currentSrc: sampleAvatarUrl,
    alt: 'User avatar',
    size: 's',
  },
};
