import React from 'react';
import { Text } from '@components/basic/Text';

type JwtDecodedPanelProps = {
  title: string;
  value: unknown | null;
  emptyText: string;
};

function JwtDecodedPanel({ title, value, emptyText }: JwtDecodedPanelProps) {
  const hasValue = value !== null && value !== undefined;

  return (
    <div className="space-y-2">
      <Text variant="d3" className="font-medium text-gray-700 dark:text-gray-300">
        {title}
      </Text>
      <pre className="w-full min-h-[300px] p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-auto text-sm font-mono text-gray-800 dark:text-gray-200">
        {hasValue ? JSON.stringify(value, null, 2) : emptyText}
      </pre>
    </div>
  );
}

export default JwtDecodedPanel;
