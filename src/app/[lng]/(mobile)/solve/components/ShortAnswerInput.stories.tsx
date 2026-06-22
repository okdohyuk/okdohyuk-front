import type { Meta, StoryObj } from '@storybook/react';
import { ShortAnswerInput } from './ShortAnswerInput';

const meta: Meta<typeof ShortAnswerInput> = {
  title: 'Solve/ShortAnswerInput',
  component: ShortAnswerInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Pristine: Story = {
  args: { graded: false },
};

export const GradedCorrect: Story = {
  args: { graded: true, isCorrect: true, submittedText: '캡슐화' },
};

export const GradedWrong: Story = {
  args: { graded: true, isCorrect: false, submittedText: '상속', correctText: '캡슐화' },
};
