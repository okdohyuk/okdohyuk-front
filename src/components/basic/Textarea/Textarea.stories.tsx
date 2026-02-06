import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Basic/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: 'Write your message...',
    rows: 4,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue: 'Sample text in textarea',
  },
};
