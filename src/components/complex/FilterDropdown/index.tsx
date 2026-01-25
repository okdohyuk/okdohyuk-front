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
          className="px-1 rounded flex items-center justify-between cursor-pointer hover:bg-basic-4 w-full"
          onClick={() => changeState(item)}
        >
          <span className={cn('t-d-1 t-basic-1', `ml-${margin * 2}`)}>{item.name}</span>
          {
            {
              in: <SquarePlus className="text-point-1" />,
              notIn: <SquareMinus className="text-red-500" />,
              idle: <Square className="t-basic-1" />,
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
      <div className="p-2 t-d-1 font-bold t-basic-1 bg-basic-4">{title}</div>
      <div className="p-2">
        {items.map((item) => renderItems(item, 0))}
        {items.length === 0
          ? Array.from({ length: 6 }, (_, index) => (
              <Skeleton className="rounded h-[28px]" key={`dropdown-skeleton-${index}`} />
            ))
          : null}
      </div>
    </div>
  );
};

export default FilterDropdown;
