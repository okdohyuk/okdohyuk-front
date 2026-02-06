import type { Meta, StoryObj } from '@storybook/react';
import Link from './index';

const meta: Meta<typeof Link> = {
  title: 'Basic/Link',
  component: Link,
  tags: ['autodocs'],
  args: {
    href: 'https://okdohyuk.dev',
    children: 'Visit okdohyuk.dev',
    hasTargetBlank: true,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const External: Story = {};
