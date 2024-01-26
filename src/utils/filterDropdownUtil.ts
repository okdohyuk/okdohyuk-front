import { FilterDropdownItem } from '~/components/complex/FilterDropdown/type';
import { BlogCategory } from '~/spec/api/Blog';

export default class FilterDropdownUtils {
  static getIns = (items: FilterDropdownItem[]): string[] => {
    const result: string[] = [];

    const checkChild = (items: FilterDropdownItem[]) => {
      for (const item of items) {
        if (item.type === 'in') {
          result.push(item.value);
        }
        if (item.child) {
          checkChild(item.child);
        }
      }
    };

    checkChild(items);
    return result;
  };
  static getNotIns = (items: FilterDropdownItem[]): string[] => {
    const result: string[] = [];

    const checkChild = (items: FilterDropdownItem[]) => {
      for (const item of items) {
        if (item.type === 'notIn') {
          result.push(item.value);
        }
        if (item.child) {
          checkChild(item.child);
        }
      }
    };

    checkChild(items);
    return result;
  };

  static getInsChain = (items: FilterDropdownItem[]): string[][] => {
    const result: string[][] = [];

    const checkChild = (items: FilterDropdownItem[], chain: string[] = []) => {
      for (const item of items) {
        if (item.type === 'in') {
          result.push([...chain, item.name]);
        }
        if (item.child) {
          checkChild(item.child, [...chain, item.name]);
        }
      }
    };

    checkChild(items);
    return result;
  };
  static getNotInsChain = (items: FilterDropdownItem[]): string[][] => {
    const result: string[][] = [];

    const checkChild = (items: FilterDropdownItem[], chain: string[] = []) => {
      for (const item of items) {
        if (item.type === 'notIn') {
          result.push([...chain, item.name]);
        }
        if (item.child) {
          checkChild(item.child, [...chain, item.name]);
        }
      }
    };

    checkChild(items);
    return result;
  };

  static byString = (array: string[]): FilterDropdownItem[] =>
    array.map((string) => ({
      value: string,
      name: string,
      type: 'idle',
    }));

  static byBlogCategory = (array: BlogCategory[]): FilterDropdownItem[] => {
    return array.map((category: BlogCategory) => ({
      value: category.id,
      name: category.name,
      type: 'idle',
      child: this.byBlogCategory(category.child),
    }));
  };

  static findValueByChain = (
    chain: string[] | undefined,
    items: FilterDropdownItem[] | undefined,
  ): string | undefined => {
    if (!chain || !items) return;

    let result: string | undefined = undefined;

    for (const item of items) {
      if (item.name === chain[0]) {
        if (chain.length === 1) {
          result = item.value;
        } else {
          return this.findValueByChain(chain.slice(1), item.child ? item.child : undefined);
        }
      }
    }

    return result;
  };
}
