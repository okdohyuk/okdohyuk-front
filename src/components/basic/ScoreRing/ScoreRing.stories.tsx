import type { Meta, StoryObj } from '@storybook/react';
import { ScoreRing } from './ScoreRing';

const meta: Meta<typeof ScoreRing> = {
  title: 'Solve/ScoreRing',
  component: ScoreRing,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { correct: 7, total: 10 },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Perfect: Story = { args: { correct: 10, total: 10 } };
export const Zero: Story = { args: { correct: 0, total: 10 } };
export const Empty: Story = { args: { correct: 0, total: 0 } };
