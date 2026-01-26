import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from './FileUpload';
import { Button } from '../Button';

const meta: Meta<typeof FileUpload> = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onFileSelect: { action: 'file selected' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Button size="s">Choose File</Button>,
  },
};

export const ImageOnly: Story = {
  args: {
    accept: 'image/*',
    children: <Button size="s">Upload Image</Button>,
  },
};

export const WithCustomTrigger: Story = {
  args: {
    accept: 'image/*',
    children: (
      <div
        style={{
          padding: '16px 24px',
          border: '2px dashed #000',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0 }}>Click or drag to upload</p>
      </div>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <Button size="s">Choose File</Button>,
  },
};
