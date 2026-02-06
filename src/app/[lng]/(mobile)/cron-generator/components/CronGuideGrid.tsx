import React from 'react';

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
    <div className="grid grid-cols-5 gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
      <div className="p-2 border rounded bg-white dark:bg-gray-800">
        <div className="font-bold mb-1">{minuteLabel}</div>
        0-59
      </div>
      <div className="p-2 border rounded bg-white dark:bg-gray-800">
        <div className="font-bold mb-1">{hourLabel}</div>
        0-23
      </div>
      <div className="p-2 border rounded bg-white dark:bg-gray-800">
        <div className="font-bold mb-1">{dayLabel}</div>
        1-31
      </div>
      <div className="p-2 border rounded bg-white dark:bg-gray-800">
        <div className="font-bold mb-1">{monthLabel}</div>
        1-12
      </div>
      <div className="p-2 border rounded bg-white dark:bg-gray-800">
        <div className="font-bold mb-1">{weekdayLabel}</div>
        0-6
      </div>
    </div>
  );
}

export default CronGuideGrid;
