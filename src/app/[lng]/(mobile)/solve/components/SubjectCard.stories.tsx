import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SubjectCard } from './SubjectCard';

const meta: Meta<typeof SubjectCard> = {
  title: 'Solve/SubjectCard',
  component: SubjectCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    title: '정보처리기사 필기',
    totalQuestions: 1786,
    unitCount: 12,
    answeredCount: 420,
    completed: false,
    color: '#7c3aed',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const InProgress: Story = { args: { answeredCount: 900 } };
export const Completed: Story = { args: { answeredCount: 1786, completed: true } };
export const NotStarted: Story = { args: { answeredCount: 0 } };
export const NoColor: Story = { args: { color: undefined } };
