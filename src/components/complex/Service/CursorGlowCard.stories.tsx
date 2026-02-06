import type { Meta, StoryObj } from '@storybook/react';
import CursorGlowCard from './CursorGlowCard';

const meta: Meta<typeof CursorGlowCard> = {
  title: 'Complex/CursorGlowCard',
  component: CursorGlowCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CursorGlowCard className="max-w-sm">
      <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200">
        마우스를 움직이면 외곽 그라디언트가 커서를 따라옵니다.
      </div>
    </CursorGlowCard>
  ),
};
