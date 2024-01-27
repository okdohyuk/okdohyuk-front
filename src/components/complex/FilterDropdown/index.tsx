import React from 'react';
import { FilterDropdownFC, FilterDropdownItem } from './type';
import {
  MdOutlineCheckBoxOutlineBlank,
  MdOutlineAddBox,
  MdOutlineIndeterminateCheckBox,
} from 'react-icons/md';
import { cls } from '~/utils/classNameUtils';

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
              in: <MdOutlineAddBox className="text-point-1" />,
              notIn: <MdOutlineIndeterminateCheckBox className="text-red-500" />,
              idle: <MdOutlineCheckBoxOutlineBlank className="t-basic-1" />,
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
      <div className="p-2">{items.map((item, index) => renderItems(item, index, 0))}</div>
    </div>
  );
};

export default FilterDropdown;
