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
      <p className="text-2xl font-bold text-fg-1">{result}</p>
    </div>
  );
}

export default CronResultCard;
