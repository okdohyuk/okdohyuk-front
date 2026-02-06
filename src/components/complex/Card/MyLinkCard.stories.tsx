import type { Meta, StoryObj } from '@storybook/react';
import MyLinkCard from './MyLinkCard';

const meta: Meta<typeof MyLinkCard> = {
  title: 'Complex/MyLinkCard',
  component: MyLinkCard,
  tags: ['autodocs'],
  args: {
    title: '개발 블로그',
    explanation: '프론트엔드와 웹 관련 포스팅 모음',
    link: 'https://blog.okdohyuk.dev',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
