import type { Meta, StoryObj } from '@storybook/react';
import { ClozeBlock } from './ClozeBlock';

const meta: Meta<typeof ClozeBlock> = {
  title: 'Solve/ClozeBlock',
  component: ClozeBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

const CODE_TEMPLATE = 'for (int i = 0; i < {{n}}; i{{op}}) {\n  sum += arr[i];\n}';
const TEXT_TEMPLATE = '객체지향의 4대 특징은 추상화, {{a}}, 상속, {{b}} 이다.';

export const CodePristine: Story = {
  args: { clozeTemplate: CODE_TEMPLATE, codeLanguage: 'java', graded: false },
};

export const TextPristine: Story = {
  args: { clozeTemplate: TEXT_TEMPLATE, graded: false },
};

export const CodeGraded: Story = {
  args: {
    clozeTemplate: CODE_TEMPLATE,
    codeLanguage: 'java',
    graded: true,
    submittedMap: { n: 'len', op: '--' },
    blankResults: [
      { blankId: 'n', correct: true, correctText: 'len' },
      { blankId: 'op', correct: false, correctText: '++' },
    ],
  },
};

export const TextGraded: Story = {
  args: {
    clozeTemplate: TEXT_TEMPLATE,
    graded: true,
    submittedMap: { a: '캡슐화', b: '다형성' },
    blankResults: [
      { blankId: 'a', correct: true, correctText: '캡슐화' },
      { blankId: 'b', correct: true, correctText: '다형성' },
    ],
  },
};
