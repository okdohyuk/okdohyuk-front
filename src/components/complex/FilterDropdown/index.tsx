import React from 'react';
import { FilterDropdownFC, FilterDropdownItem } from './type';
import { Square, SquareMinus, SquarePlus } from 'lucide-react';
import { cls } from '~/utils/classNameUtils';
import Skeleton from '@components/basic/Skeleton';

const FilterDropdown: FilterDropdownFC = ({ title, items, changeType }) => {
  const changeState = (item: FilterDropdownItem) => {
    if (item.type === 'in') {
      changeType(item.value, 'notIn');
    } else if (item.type === 'notIn') {
      changeType(item.value, 'idle');
    } else {
      changeType(item.value, 'in');
    }
  };

  const renderItems = (item: FilterDropdownItem, index: number, margin: number) => {
    return (
      <React.Fragment key={index + item.value}>
        <div
          key={item.value}
          className="px-1 rounded flex items-center justify-between cursor-pointer hover:bg-basic-4"
          onClick={() => changeState(item)}
        >
          <div className={cls('t-d-1 t-basic-1', 'ml-' + margin * 2)}>{item.name}</div>
          {
            {
              in: <SquarePlus className="text-point-1" />,
              notIn: <SquareMinus className="text-red-500" />,
              idle: <Square className="t-basic-1" />,
            }[item.type]
          }
        </div>
        {item.child?.map((item, index) => renderItems(item, index, margin + 1))}
      </React.Fragment>
    );
  };

  return (
    <div>
      <div className="p-2 t-d-1 font-bold t-basic-1 bg-basic-4">{title}</div>
      <div className="p-2">
        {items.map((item, index) => renderItems(item, index, 0))}
        {items.length === 0
          ? [...new Array(6)].map((d, i) => <Skeleton className={'rounded h-[28px]'} key={i} />)
          : null}
      </div>
    </div>
  );
};

export default FilterDropdown;
