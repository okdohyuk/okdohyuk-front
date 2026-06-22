import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Solve/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    code: 'public int sum(int[] arr) {\n  int total = 0;\n  for (int v : arr) total += v;\n  return total;\n}',
    language: 'java',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLanguage: Story = {};
export const WithoutLanguage: Story = { args: { language: undefined } };
