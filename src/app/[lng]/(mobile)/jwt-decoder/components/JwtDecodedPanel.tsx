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
      <Text variant="d3" className="font-medium text-fg-3">
        {title}
      </Text>
      <pre className="w-full min-h-[300px] overflow-auto rounded-lg border border-basic-3 bg-basic-1 p-4 text-sm font-mono text-fg-2">
        {hasValue ? JSON.stringify(value, null, 2) : emptyText}
      </pre>
    </div>
  );
}

export default JwtDecodedPanel;
