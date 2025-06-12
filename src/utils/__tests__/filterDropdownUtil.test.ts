import FilterDropdownUtils from '../filterDropdownUtil';
import { FilterDropdownItem } from '~/components/complex/FilterDropdown/type';
import { BlogCategory } from '~/spec/api/Blog';

const mockItems: FilterDropdownItem[] = [
  {
    name: 'Category A',
    value: 'A',
    type: 'in',
    child: [
      { name: 'Sub A1', value: 'A1', type: 'notIn' },
      {
        name: 'Sub A2',
        value: 'A2',
        type: 'in',
        child: [{ name: 'Sub A2-1', value: 'A21', type: 'in' }],
      },
    ],
  },
  { name: 'Category B', value: 'B', type: 'idle' },
  { name: 'Category C', value: 'C', type: 'notIn' },
];

const mockBlogCategories: BlogCategory[] = [
  {
    id: 'tech',
    name: 'Technology',
    child: [
      { id: 'js', name: 'JavaScript', child: [] },
      { id: 'python', name: 'Python', child: [] },
    ],
  },
  { id: 'life', name: 'Lifestyle', child: [] },
];

describe('FilterDropdownUtils', () => {
  describe('getIns', () => {
    it('type이 in인 아이템의 value 목록을 반환해야 합니다', () => {
      expect(FilterDropdownUtils.getIns(mockItems)).toEqual(['A', 'A2', 'A21']);
    });
    it('type이 in인 아이템이 없으면 빈 배열을 반환해야 합니다', () => {
      const noInItems: FilterDropdownItem[] = [{ name: 'X', value: 'X', type: 'notIn' }];
      expect(FilterDropdownUtils.getIns(noInItems)).toEqual([]);
    });
    it('빈 배열이 입력되면 빈 배열을 반환해야 합니다', () => {
      expect(FilterDropdownUtils.getIns([])).toEqual([]);
    });
  });

  describe('getNotIns', () => {
    it('type이 notIn인 아이템의 value 목록을 반환해야 합니다', () => {
      expect(FilterDropdownUtils.getNotIns(mockItems)).toEqual(['A1', 'C']);
    });
    it('type이 notIn인 아이템이 없으면 빈 배열을 반환해야 합니다', () => {
      const noNotInItems: FilterDropdownItem[] = [{ name: 'X', value: 'X', type: 'in' }];
      expect(FilterDropdownUtils.getNotIns(noNotInItems)).toEqual([]);
    });
    it('빈 배열이 입력되면 빈 배열을 반환해야 합니다', () => {
      expect(FilterDropdownUtils.getNotIns([])).toEqual([]);
    });
  });

  describe('getInsChain', () => {
    it('type이 in인 아이템의 name chain 목록을 반환해야 합니다', () => {
      expect(FilterDropdownUtils.getInsChain(mockItems)).toEqual([
        ['Category A'],
        ['Category A', 'Sub A2'],
        ['Category A', 'Sub A2', 'Sub A2-1'],
      ]);
    });
    it('type이 in인 아이템이 없으면 빈 배열을 반환해야 합니다', () => {
      const noInItems: FilterDropdownItem[] = [{ name: 'X', value: 'X', type: 'notIn' }];
      expect(FilterDropdownUtils.getInsChain(noInItems)).toEqual([]);
    });
  });

  describe('getNotInsChain', () => {
    it('type이 notIn인 아이템의 name chain 목록을 반환해야 합니다', () => {
      expect(FilterDropdownUtils.getNotInsChain(mockItems)).toEqual([
        ['Category A', 'Sub A1'],
        ['Category C'],
      ]);
    });
    it('type이 notIn인 아이템이 없으면 빈 배열을 반환해야 합니다', () => {
      const noNotInItems: FilterDropdownItem[] = [{ name: 'X', value: 'X', type: 'in' }];
      expect(FilterDropdownUtils.getNotInsChain(noNotInItems)).toEqual([]);
    });
  });

  describe('byString', () => {
    it('문자열 배열을 FilterDropdownItem 배열로 변환해야 합니다', () => {
      const strings = ['Apple', 'Banana'];
      const expected: FilterDropdownItem[] = [
        { name: 'Apple', value: 'Apple', type: 'idle' },
        { name: 'Banana', value: 'Banana', type: 'idle' },
      ];
      expect(FilterDropdownUtils.byString(strings)).toEqual(expected);
    });
    it('빈 문자열 배열은 빈 FilterDropdownItem 배열로 변환해야 합니다', () => {
      expect(FilterDropdownUtils.byString([])).toEqual([]);
    });
  });

  describe('byBlogCategory', () => {
    it('BlogCategory 배열을 FilterDropdownItem 배열로 변환해야 합니다 (계층 구조 유지)', () => {
      const expected: FilterDropdownItem[] = [
        {
          name: 'Technology',
          value: 'tech',
          type: 'idle',
          child: [
            { name: 'JavaScript', value: 'js', type: 'idle', child: [] },
            { name: 'Python', value: 'python', type: 'idle', child: [] },
          ],
        },
        { name: 'Lifestyle', value: 'life', type: 'idle', child: [] },
      ];
      expect(FilterDropdownUtils.byBlogCategory(mockBlogCategories)).toEqual(expected);
    });
    it('빈 BlogCategory 배열은 빈 FilterDropdownItem 배열로 변환해야 합니다', () => {
      expect(FilterDropdownUtils.byBlogCategory([])).toEqual([]);
    });
  });

  describe('findValueByChain', () => {
    it('최상위 아이템의 value를 반환해야 합니다', () => {
      expect(FilterDropdownUtils.findValueByChain(['Category A'], mockItems)).toBe('A');
    });
    it('중첩된 아이템의 value를 반환해야 합니다', () => {
      expect(FilterDropdownUtils.findValueByChain(['Category A', 'Sub A2'], mockItems)).toBe('A2');
    });
    it('가장 깊게 중첩된 아이템의 value를 반환해야 합니다', () => {
      expect(
        FilterDropdownUtils.findValueByChain(['Category A', 'Sub A2', 'Sub A2-1'], mockItems),
      ).toBe('A21');
    });
    it('chain이 undefined이면 undefined를 반환해야 합니다', () => {
      expect(FilterDropdownUtils.findValueByChain(undefined, mockItems)).toBeUndefined();
    });
    it('items가 undefined이면 undefined를 반환해야 합니다', () => {
      expect(FilterDropdownUtils.findValueByChain(['Category A'], undefined)).toBeUndefined();
    });
    it('존재하지 않는 chain이면 undefined를 반환해야 합니다', () => {
      expect(FilterDropdownUtils.findValueByChain(['NonExistent'], mockItems)).toBeUndefined();
    });
    it('중간 chain이 존재하지 않으면 undefined를 반환해야 합니다', () => {
      expect(
        FilterDropdownUtils.findValueByChain(['Category A', 'NonExistentSub'], mockItems),
      ).toBeUndefined();
    });
  });
});
