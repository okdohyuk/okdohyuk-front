import type { Meta, StoryObj } from '@storybook/react';
import ServicePageHeader from './ServicePageHeader';

const meta: Meta<typeof ServicePageHeader> = {
  title: 'Complex/ServicePageHeader',
  component: ServicePageHeader,
  tags: ['autodocs'],
  args: {
    title: '퍼센트 계산기',
    description: '할인율, 증감률처럼 자주 쓰는 퍼센트 계산 6가지',
    badge: '계산/금융',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  args: {
    title: '간단 헤더',
    description: undefined,
    badge: undefined,
  },
};
