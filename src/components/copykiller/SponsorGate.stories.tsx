import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserRoleEnum } from '@api/User';
import SponsorGate from './SponsorGate';

const meta: Meta<typeof SponsorGate> = {
  title: 'Copykiller/SponsorGate',
  component: SponsorGate,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    loginTitle: '로그인이 필요합니다',
    loginDescription: '안티 카피킬러는 로그인 후 이용할 수 있습니다.',
    loginCta: '로그인하기',
    sponsorTitle: '후원자 전용 도구',
    sponsorDescription: '이 도구는 후원자에게만 제공됩니다. 후원을 통해 이용해 보세요.',
    sponsorCta: '후원 페이지로',
    loginHref: '/auth/login',
    sponsorHref: '/sponsor',
  },
};

export default meta;
type Story = StoryObj<typeof SponsorGate>;

/** 비로그인 상태 */
export const Guest: Story = {
  args: {
    userRole: null,
    children: <div>후원자 전용 콘텐츠</div>,
  },
};

/** 로그인 + 비후원자 */
export const LoggedInUser: Story = {
  args: {
    userRole: UserRoleEnum.User,
    children: <div>후원자 전용 콘텐츠</div>,
  },
};

/** 후원자 — children 렌더링 */
export const Sponsor: Story = {
  args: {
    userRole: UserRoleEnum.Sponsor,
    children: (
      <div className="rounded-xl border border-basic-3 bg-basic-0 p-6 text-fg-1">
        후원자 전용 콘텐츠가 여기에 표시됩니다.
      </div>
    ),
  },
};

/** 어드민 — children 렌더링 */
export const Admin: Story = {
  args: {
    userRole: UserRoleEnum.Admin,
    children: (
      <div className="rounded-xl border border-basic-3 bg-basic-0 p-6 text-fg-1">
        어드민 — 모든 도구 접근 가능.
      </div>
    ),
  },
};
