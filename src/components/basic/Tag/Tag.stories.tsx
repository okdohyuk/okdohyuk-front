import type { Meta, StoryObj } from '@storybook/react';
import Tag from './index';

const meta: Meta<typeof Tag> = {
  title: 'Basic/Tag',
  component: Tag,
  tags: ['autodocs'],
  args: {
    tag: 'frontend',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
