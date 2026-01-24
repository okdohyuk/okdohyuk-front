import { Blog, BlogCategory, BlogRequest } from '~/spec/api/Blog';
import BlogUtils from '../blogUtils';

const mockCategories: BlogCategory[] = [
  {
    id: '1',
    name: 'Tech',
    child: [
      {
        id: '1-1',
        name: 'Programming',
        child: [{ id: '1-1-1', name: 'JavaScript', child: [] }],
      },
      { id: '1-2', name: 'Hardware', child: [] },
    ],
  },
  {
    id: '2',
    name: 'Life',
    child: [],
  },
];

describe('BlogUtils', () => {
  describe('findIdByCategoryChain', () => {
    it('최상위 카테고리 ID를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain(['Tech'], mockCategories)).toBe('1');
    });

    it('중첩된 카테고리 ID를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain(['Tech', 'Programming'], mockCategories)).toBe('1-1');
    });

    it('가장 깊은 중첩된 카테고리 ID를 반환해야 합니다', () => {
      expect(
        BlogUtils.findIdByCategoryChain(['Tech', 'Programming', 'JavaScript'], mockCategories),
      ).toBe('1-1-1');
    });

    it('다른 최상위 카테고리 ID를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain(['Life'], mockCategories)).toBe('2');
    });

    it('존재하지 않는 최상위 카테고리의 경우 undefined를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain(['NonExistent'], mockCategories)).toBeUndefined();
    });

    it('존재하지 않는 하위 카테고리의 경우 undefined를 반환해야 합니다', () => {
      expect(
        BlogUtils.findIdByCategoryChain(['Tech', 'NonExistent'], mockCategories),
      ).toBeUndefined();
    });

    it('categoryChain이 undefined인 경우 undefined를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain(undefined, mockCategories)).toBeUndefined();
    });

    it('categoryChain이 빈 배열인 경우 undefined를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain([], mockCategories)).toBeUndefined();
    });

    it('categories가 undefined인 경우 undefined를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain(['Tech'], undefined)).toBeUndefined();
    });

    it('categories가 빈 배열인 경우 undefined를 반환해야 합니다', () => {
      expect(BlogUtils.findIdByCategoryChain(['Tech'], [])).toBeUndefined();
    });
  });

  describe('findCategoryChainById', () => {
    it('최상위 카테고리 체인을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById(mockCategories, '1')).toEqual(['Tech']);
    });

    it('중첩된 카테고리 체인을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById(mockCategories, '1-1')).toEqual([
        'Tech',
        'Programming',
      ]);
    });

    it('가장 깊은 중첩된 카테고리 체인을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById(mockCategories, '1-1-1')).toEqual([
        'Tech',
        'Programming',
        'JavaScript',
      ]);
    });

    it('다른 최상위 카테고리 체인을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById(mockCategories, '2')).toEqual(['Life']);
    });

    it('존재하지 않는 ID의 경우 빈 배열을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById(mockCategories, 'NonExistent')).toEqual([]);
    });

    it('ID가 undefined인 경우 빈 배열을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById(mockCategories, undefined)).toEqual([]);
    });

    it('categories가 undefined인 경우 빈 배열을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById(undefined, '1')).toEqual([]);
    });

    it('categories가 빈 배열인 경우 빈 배열을 반환해야 합니다', () => {
      expect(BlogUtils.findCategoryChainById([], '1')).toEqual([]);
    });
  });

  describe('toBlogRequest', () => {
    const mockBlog: Blog = {
      id: 1,
      title: 'Test Blog',
      urlSlug: 'test-blog',
      isPublic: true,
      contents: 'Test Content',
      categoryChain: ['Tech', 'Programming'],
      tags: [],
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      likeCount: 0,
      viewCount: 0,
    };

    it('올바른 categoryId를 포함하는 BlogRequest 객체를 반환해야 합니다', () => {
      const expectedRequest: BlogRequest = {
        ...mockBlog,
        categoryId: '1-1',
      };
      expect(BlogUtils.toBlogRequest(mockBlog, mockCategories)).toEqual(expectedRequest);
    });

    it('categoryChain에 해당하는 ID가 없으면 categoryId가 undefined인 BlogRequest 객체를 반환해야 합니다', () => {
      const blogWithInvalidChain: Blog = {
        ...mockBlog,
        categoryChain: ['NonExistent'],
      };
      const expectedRequest: BlogRequest = {
        ...blogWithInvalidChain,
        categoryId: undefined,
      };
      expect(BlogUtils.toBlogRequest(blogWithInvalidChain, mockCategories)).toEqual(
        expectedRequest,
      );
    });

    it('categoryChain이 undefined이면 categoryId가 undefined인 BlogRequest 객체를 반환해야 합니다', () => {
      const blogWithUndefinedChain: Blog = {
        ...mockBlog,
        categoryChain: [],
      };
      const expectedRequest: BlogRequest = {
        ...blogWithUndefinedChain,
        categoryId: undefined,
      };
      expect(BlogUtils.toBlogRequest(blogWithUndefinedChain, mockCategories)).toEqual(
        expectedRequest,
      );
    });
  });
});
