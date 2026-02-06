import type { Meta, StoryObj } from '@storybook/react';
import { H1, H2, H3 } from './Headers';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Basic/Text',
  component: Text,
  tags: ['autodocs'],
  args: {
    children: 'Body text sample',
    variant: 'd2',
    color: 'basic-2',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Headings: Story = {
  render: () => (
    <div className="space-y-2">
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
    </div>
  ),
};
