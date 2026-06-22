import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChoiceButton } from './ChoiceButton';

const meta: Meta<typeof ChoiceButton> = {
  title: 'Solve/ChoiceButton',
  component: ChoiceButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    index: 1,
    text: '운영체제는 컴퓨터 시스템의 자원을 관리한다.',
    state: 'default',
    locked: false,
  },
  argTypes: {
    state: { control: 'select', options: ['default', 'selected', 'correct', 'wrong', 'dimmed'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { state: 'selected' } };
export const Correct: Story = { args: { state: 'correct', locked: true } };
export const Wrong: Story = { args: { state: 'wrong', locked: true } };
export const Dimmed: Story = { args: { state: 'dimmed', locked: true } };

export const AllStates: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-3.5">
      <ChoiceButton index={1} text="채점 후 정답 선택지" state="correct" locked />
      <ChoiceButton index={2} text="사용자가 고른 오답" state="wrong" locked />
      <ChoiceButton index={3} text="채점 후 나머지(dimmed)" state="dimmed" locked />
      <ChoiceButton index={4} text="기본 상태(hover 가능)" state="default" />
    </div>
  ),
};
