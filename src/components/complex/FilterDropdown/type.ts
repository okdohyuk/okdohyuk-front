type FilterDropdownItem = {
  name: string;
  value: string;
  child?: FilterDropdownItem[];
  type: 'in' | 'notIn' | 'idle';
};

type FilterDropdownProps = {
  title: string;
  items: FilterDropdownItem[];
  changeType: (value: string, type: 'in' | 'notIn' | 'idle') => void;
};

type FilterDropdownFC = React.FC<FilterDropdownProps>;

export type { FilterDropdownFC, FilterDropdownItem };
