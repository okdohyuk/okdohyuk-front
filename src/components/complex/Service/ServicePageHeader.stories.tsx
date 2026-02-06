import type { Meta, StoryObj } from '@storybook/react';
import ServicePageHeader from './ServicePageHeader';

const meta: Meta<typeof ServicePageHeader> = {
  title: 'Complex/ServicePageHeader',
  component: ServicePageHeader,
  tags: ['autodocs'],
  args: {
    title: '서비스 대시보드',
    description: '핵심 도구와 운영 지표를 한 화면에서 관리합니다.',
    badge: 'Service Console',
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
