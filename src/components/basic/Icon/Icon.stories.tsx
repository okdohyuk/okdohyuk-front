import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'lucide-react';
import Icon from './index';

const meta: Meta<typeof Icon> = {
  title: 'Basic/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: {
    icon: <Search />,
    size: 20,
    className: 'text-point-1',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
