'use client';

import React from 'react';
import { Input } from '@components/basic/Input';

type CronExpressionInputProps = {
  label: string;
  placeholder: string;
  expression: string;
  error: string | null;
  onChange: (value: string) => void;
};

function CronExpressionInput({
  label,
  placeholder,
  expression,
  error,
  onChange,
}: CronExpressionInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="cron-input"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <Input
        id="cron-input"
        className="font-mono text-lg"
        placeholder={placeholder}
        value={expression}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <p className="text-sm text-red-500 font-medium animate-pulse">{error}</p>}
    </div>
  );
}

export default CronExpressionInput;
