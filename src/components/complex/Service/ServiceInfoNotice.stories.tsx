import type { Meta, StoryObj } from '@storybook/react';
import { Info } from 'lucide-react';
import ServiceInfoNotice from './ServiceInfoNotice';

const meta: Meta<typeof ServiceInfoNotice> = {
  title: 'Complex/ServiceInfoNotice',
  component: ServiceInfoNotice,
  tags: ['autodocs'],
  args: {
    icon: <Info className="h-5 w-5" />,
    children: '필수 안내 문구를 이 영역에서 전달합니다.',
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAction: Story = {
  args: {
    action: (
      <button
        type="button"
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold"
      >
        확인
      </button>
    ),
  },
};
