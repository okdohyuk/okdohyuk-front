'use client';

import React from 'react';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type CronExpressionInputProps = {
  label: string;
  expression: string;
};

function CronExpressionInput({ label, expression }: CronExpressionInputProps) {
  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
      <label htmlFor="cron-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Input id="cron-input" className="font-mono text-lg" value={expression} readOnly />
    </div>
  );
}

export default CronExpressionInput;
