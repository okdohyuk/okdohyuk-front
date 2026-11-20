import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Keycap } from './Keycap';

const meta: Meta<typeof Keycap> = {
  title: 'Basic/Keycap',
  component: Keycap,
  tags: ['autodocs'],
  args: {
    children: '⌘K',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Set: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Keycap>⌘K</Keycap>
      <Keycap>Ctrl K</Keycap>
      <Keycap>ESC</Keycap>
      <Keycap>↑↓</Keycap>
      <Keycap>↵</Keycap>
    </div>
  ),
};
