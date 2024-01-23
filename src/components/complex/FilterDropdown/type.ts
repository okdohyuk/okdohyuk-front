type FilterType = 'in' | 'notIn' | 'idle';

type FilterDropdownItem = {
  name: string;
  value: string;
  child?: FilterDropdownItem[];
  type: FilterType;
};

type FilterDropdownProps = {
  title: string;
  items: FilterDropdownItem[];
  changeType: (value: string, type: FilterType) => void;
};

type FilterDropdownFC = React.FC<FilterDropdownProps>;

export type { FilterDropdownFC, FilterDropdownItem, FilterType };
