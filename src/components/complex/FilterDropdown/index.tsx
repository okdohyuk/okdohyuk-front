import React, { useCallback } from 'react';
import { Square, SquareMinus, SquarePlus } from 'lucide-react';
import Skeleton from '@components/basic/Skeleton';
import { cn } from '@utils/cn';
import { FilterDropdownFC, FilterDropdownItem } from './type';

const FilterDropdown: FilterDropdownFC = function FilterDropdown({ title, items, changeType }) {
  const changeState = useCallback(
    (item: FilterDropdownItem) => {
      if (item.type === 'in') {
        changeType(item.value, 'notIn');
      } else if (item.type === 'notIn') {
        changeType(item.value, 'idle');
      } else {
        changeType(item.value, 'in');
      }
    },
    [changeType],
  );

  const renderItems = useCallback(
    (item: FilterDropdownItem, margin: number): React.ReactNode => (
      <React.Fragment key={`${item.value}-${margin}`}>
        <button
          type="button"
          className={cn(
            'mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors',
            item.type === 'in' && 'bg-point-4/50 dark:bg-point-1/15',
            item.type === 'notIn' && 'bg-red-100/80 dark:bg-red-900/25',
            item.type === 'idle' && 'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          )}
          onClick={() => changeState(item)}
        >
          <span
            className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200"
            style={{ paddingLeft: `${margin * 12}px` }}
          >
            {item.name}
          </span>
          {
            {
              in: <SquarePlus className="h-4 w-4 text-point-1" />,
              notIn: <SquareMinus className="h-4 w-4 text-red-500" />,
              idle: <Square className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />,
            }[item.type]
          }
        </button>
        {item.child?.map((child) => renderItems(child, margin + 1))}
      </React.Fragment>
    ),
    [changeState],
  );

  return (
    <div>
      <div className="border-b border-zinc-200/80 bg-zinc-100/80 px-3 py-2 text-sm font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100">
        {title}
      </div>
      <div className="space-y-1 p-2">
        {items.map((item) => renderItems(item, 0))}
        {items.length === 0
          ? Array.from({ length: 6 }, (_, index) => (
              <Skeleton className="h-[28px] rounded-lg" key={`dropdown-skeleton-${index}`} />
            ))
          : null}
      </div>
    </div>
  );
};

export default FilterDropdown;
