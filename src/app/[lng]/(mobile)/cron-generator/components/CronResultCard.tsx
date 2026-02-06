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
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{result}</p>
    </div>
  );
}

export default CronResultCard;
