import React from 'react';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type CronGuideGridProps = {
  minuteLabel: string;
  hourLabel: string;
  dayLabel: string;
  monthLabel: string;
  weekdayLabel: string;
};

function CronGuideGrid({
  minuteLabel,
  hourLabel,
  dayLabel,
  monthLabel,
  weekdayLabel,
}: CronGuideGridProps) {
  return (
    <div
      className={cn(SERVICE_PANEL_SOFT, 'grid grid-cols-5 gap-2 p-3 text-center text-xs text-fg-5')}
    >
      <div className="rounded-xl border border-basic-3 bg-basic-0/90 p-2">
        <div className="font-bold mb-1">{minuteLabel}</div>
        0-59
      </div>
      <div className="rounded-xl border border-basic-3 bg-basic-0/90 p-2">
        <div className="font-bold mb-1">{hourLabel}</div>
        0-23
      </div>
      <div className="rounded-xl border border-basic-3 bg-basic-0/90 p-2">
        <div className="font-bold mb-1">{dayLabel}</div>
        1-31
      </div>
      <div className="rounded-xl border border-basic-3 bg-basic-0/90 p-2">
        <div className="font-bold mb-1">{monthLabel}</div>
        1-12
      </div>
      <div className="rounded-xl border border-basic-3 bg-basic-0/90 p-2">
        <div className="font-bold mb-1">{weekdayLabel}</div>
        0-6
      </div>
    </div>
  );
}

export default CronGuideGrid;
