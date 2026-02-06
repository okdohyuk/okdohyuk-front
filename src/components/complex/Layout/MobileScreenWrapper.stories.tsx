import type { Meta, StoryObj } from '@storybook/react';
import MobileScreenWrapper from './MobileScreenWrapper';

const meta: Meta<typeof MobileScreenWrapper> = {
  title: 'Complex/MobileScreenWrapper',
  component: MobileScreenWrapper,
  tags: ['autodocs'],
  args: {
    children: <div className="rounded-xl bg-white/80 p-4">서비스 콘텐츠</div>,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Centered: Story = {
  args: {
    items: 'center',
    text: 'center',
    children: <div className="rounded-xl bg-white/80 p-4">중앙 정렬 콘텐츠</div>,
  },
};
