import type { Meta, StoryObj } from '@storybook/react';
import AsideScreenWrapper from './AsideScreenWrapper';

const meta: Meta<typeof AsideScreenWrapper> = {
  title: 'Complex/AsideScreenWrapper',
  component: AsideScreenWrapper,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    left: <div className="p-4 text-sm">Left Ad</div>,
    right: <div className="p-4 text-sm">Right Ad</div>,
    children: <div className="rounded-xl bg-white/80 p-4">Main Content</div>,
  },
};
