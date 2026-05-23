import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Basic/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

const TIER_OPTIONS = [
  { value: 'general', label: '일반' },
  { value: 'youth', label: '청년' },
  { value: 'lowIncome', label: '저소득층' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string>('general');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        options={TIER_OPTIONS}
        ariaLabel="환급 계층"
      />
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState<string>('general');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        options={TIER_OPTIONS}
        size="sm"
        ariaLabel="환급 계층"
      />
    );
  },
};

export const WithDisabled: Story = {
  render: () => {
    const [value, setValue] = useState<string>('general');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        options={[
          { value: 'general', label: '일반' },
          { value: 'youth', label: '청년' },
          { value: 'lowIncome', label: '저소득층 (준비중)', disabled: true },
        ]}
        ariaLabel="환급 계층"
      />
    );
  },
};
