import React from 'react';
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

/** `color="inherit"` drops the default fg colour so a parent's colour (e.g. inline style) applies. */
export const InheritColor: Story = {
  render: () => (
    <div className="rounded-lg p-6" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
      <Text variant="t3" color="inherit">
        Preview heading
      </Text>
      <Text variant="d3" color="inherit" className="mt-2 block">
        Body text in the parent colour
      </Text>
    </div>
  ),
};
