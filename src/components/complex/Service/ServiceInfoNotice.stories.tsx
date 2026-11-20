import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Info } from 'lucide-react';
import { Button } from '@components/basic/Button';
import ServiceInfoNotice from './ServiceInfoNotice';

const meta: Meta<typeof ServiceInfoNotice> = {
  title: 'Complex/ServiceInfoNotice',
  component: ServiceInfoNotice,
  tags: ['autodocs'],
  args: {
    icon: <Info className="h-4 w-4" />,
    children: '필수 안내 문구를 이 영역에서 전달합니다.',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <Button type="button" variant="secondary" size="sm">
        확인
      </Button>
    ),
  },
};
