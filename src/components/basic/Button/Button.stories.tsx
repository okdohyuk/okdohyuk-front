import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Basic/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: '계산하기',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'icon'] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', children: '초기화' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: '취소' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: '삭제' },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
      <Button {...args} size="icon" aria-label="다음">
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};
