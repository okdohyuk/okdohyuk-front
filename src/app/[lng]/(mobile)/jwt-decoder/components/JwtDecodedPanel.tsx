import React from 'react';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type JwtDecodedPanelProps = {
  title: string;
  value: unknown | null;
  emptyText: string;
};

function JwtDecodedPanel({ title, value, emptyText }: JwtDecodedPanelProps) {
  const hasValue = value !== null && value !== undefined;

  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
      <Text variant="d3" className="font-medium text-gray-700 dark:text-gray-300">
        {title}
      </Text>
      <pre className="w-full min-h-[300px] overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm font-mono text-gray-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200">
        {hasValue ? JSON.stringify(value, null, 2) : emptyText}
      </pre>
    </div>
  );
}

export default JwtDecodedPanel;
