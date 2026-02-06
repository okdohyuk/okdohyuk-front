'use client';

import React from 'react';
import { Input } from '@components/basic/Input';

type CronExpressionInputProps = {
  label: string;
  expression: string;
};

function CronExpressionInput({ label, expression }: CronExpressionInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="cron-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Input id="cron-input" className="font-mono text-lg" value={expression} readOnly />
    </div>
  );
}

export default CronExpressionInput;
