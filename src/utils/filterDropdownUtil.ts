import { FilterDropdownItem } from '~/components/complex/FilterDropdown/type';
import { BlogCategory } from '~/spec/api/Blog';

export default class FilterDropdownUtils {
  private static traverse(
    items: FilterDropdownItem[],
    visitor: (item: FilterDropdownItem, chain: string[]) => void,
    chain: string[] = [],
  ): void {
    items.forEach((item) => {
      visitor(item, chain);
      if (item.child && item.child.length > 0) {
        FilterDropdownUtils.traverse(item.child, visitor, [...chain, item.name]);
      }
    });
  }

  static getIns = (items: FilterDropdownItem[]): string[] => {
    const result: string[] = [];
    FilterDropdownUtils.traverse(items, (item) => {
      if (item.type === 'in') {
        result.push(item.value);
      }
    });
    return result;
  };

  static getNotIns = (items: FilterDropdownItem[]): string[] => {
    const result: string[] = [];
    FilterDropdownUtils.traverse(items, (item) => {
      if (item.type === 'notIn') {
        result.push(item.value);
      }
    });
    return result;
  };

  static getInsChain = (items: FilterDropdownItem[]): string[][] => {
    const result: string[][] = [];
    FilterDropdownUtils.traverse(items, (item, chain) => {
      if (item.type === 'in') {
        result.push([...chain, item.name]);
      }
    });
    return result;
  };

  static getNotInsChain = (items: FilterDropdownItem[]): string[][] => {
    const result: string[][] = [];
    FilterDropdownUtils.traverse(items, (item, chain) => {
      if (item.type === 'notIn') {
        result.push([...chain, item.name]);
      }
    });
    return result;
  };

  static byString = (array: string[]): FilterDropdownItem[] =>
    array.map((string) => ({
      value: string,
      name: string,
      type: 'idle',
    }));

  static byBlogCategory = (array: BlogCategory[]): FilterDropdownItem[] =>
    array.map((category) => ({
      value: category.id,
      name: category.name,
      type: 'idle',
      child: FilterDropdownUtils.byBlogCategory(category.child),
    }));

  static findValueByChain = (
    chain: string[] | undefined,
    items: FilterDropdownItem[] | undefined,
  ): string | undefined => {
    if (!chain?.length || !items) {
      return undefined;
    }

    const [current, ...rest] = chain;
    const matched = items.find((item) => item.name === current);
    if (!matched) {
      return undefined;
    }

    if (rest.length === 0) {
      return matched.value;
    }

    return matched.child ? FilterDropdownUtils.findValueByChain(rest, matched.child) : undefined;
  };
}
