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
  args: {},
};

export const WithExistingImage: Story = {
  args: {
    currentSrc: sampleAvatarUrl,
  },
};

export const Uploading: Story = {
  args: {
    isUploading: true,
  },
};
