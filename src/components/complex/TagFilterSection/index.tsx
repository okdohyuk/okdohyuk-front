import React, { useCallback } from 'react';
import Skeleton from '@components/basic/Skeleton';
import { cn } from '@utils/cn';
import { FilterDropdownItem, FilterType } from '../FilterDropdown/type';

type TagFilterSectionProps = {
  title: string;
  items: FilterDropdownItem[];
  changeType: (value: string, type: FilterType) => void;
};

const TagFilterSection: React.FC<TagFilterSectionProps> = function TagFilterSection({
  title,
  items,
  changeType,
}) {
  const handleClick = useCallback(
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

  return (
    <div>
      <div className="border-b border-basic-3 bg-basic-1 px-3 py-2 text-sm font-medium text-fg-1">
        {title}
      </div>
      <div className="flex flex-wrap gap-1.5 p-2">
        {items.length === 0
          ? Array.from({ length: 8 }, (_, i) => (
              <Skeleton
                key={`tag-skeleton-${i}`}
                className={cn(
                  'h-[26px] rounded-full',
                  ['w-12', 'w-16', 'w-10', 'w-20', 'w-14', 'w-12', 'w-16', 'w-10'][i],
                )}
              />
            ))
          : items.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleClick(item)}
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                  item.type === 'idle' && 'bg-basic-2 text-fg-3 hover:bg-basic-3 hover:text-fg-2',
                  item.type === 'in' && 'bg-basic-0 text-point-fg ring-1 ring-inset ring-point-2',
                  item.type === 'notIn' &&
                    'bg-danger-4/80 text-danger-2 dark:bg-danger-1/25 dark:text-danger-1',
                )}
              >
                {item.type === 'in' && <span className="font-medium">+</span>}
                {item.type === 'notIn' && <span className="font-medium">-</span>}
                {item.name}
              </button>
            ))}
      </div>
    </div>
  );
};

export default TagFilterSection;
