import type { Meta, StoryObj } from '@storybook/react';
import { ExplanationPanel } from './ExplanationPanel';

const meta: Meta<typeof ExplanationPanel> = {
  title: 'Solve/ExplanationPanel',
  component: ExplanationPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    explanation:
      '캡슐화는 데이터와 그 데이터를 처리하는 메서드를 하나로 묶고, 외부에서 직접 접근하지 못하도록 은닉하는 것이다.',
    slides: '12',
    trapType: '용어 혼동',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Correct: Story = { args: { correct: true } };
export const Wrong: Story = { args: { correct: false } };
export const NoMeta: Story = { args: { correct: true, slides: undefined, trapType: undefined } };
