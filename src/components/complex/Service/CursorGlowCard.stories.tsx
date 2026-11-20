import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CursorGlowCard from './CursorGlowCard';
import { SERVICE_CARD_INTERACTIVE, SERVICE_PANEL_SOFT } from './interactiveStyles';

const meta: Meta<typeof CursorGlowCard> = {
  title: 'Complex/CursorGlowCard',
  component: CursorGlowCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CursorGlowCard className="max-w-sm">
      <div className={`${SERVICE_PANEL_SOFT} ${SERVICE_CARD_INTERACTIVE} p-4 text-sm text-fg-3`}>
        조용한 카드. 호버하면 테두리 색만 바뀝니다
      </div>
    </CursorGlowCard>
  ),
};
