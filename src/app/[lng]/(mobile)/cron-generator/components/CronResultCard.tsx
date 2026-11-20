import React from 'react';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type CronResultCardProps = {
  title: string;
  result: string;
};

function CronResultCard({ title, result }: CronResultCardProps) {
  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'p-6')}>
      <h3 className="text-sm font-medium text-fg-5 mb-2">{title}</h3>
      <p className="break-all font-mono text-2xl font-medium tabular-nums text-fg-1 md:text-3xl">
        {result}
      </p>
    </div>
  );
}

export default CronResultCard;
