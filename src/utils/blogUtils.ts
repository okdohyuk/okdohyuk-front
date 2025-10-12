import { Blog, BlogCategory, BlogRequest } from '~/spec/api/Blog';

export default class BlogUtils {
  static toBlogRequest(blog: Blog, categories: BlogCategory[]): BlogRequest {
    return {
      ...blog,
      categoryId: this.findIdByCategoryChain(blog.categoryChain, categories),
    };
  }

  static findIdByCategoryChain = (
    categoryChain: string[] | undefined,
    categories: BlogCategory[] | undefined,
  ): string | undefined => {
    if (!categoryChain?.length || !categories?.length) {
      return undefined;
    }

    const [currentCategoryName, ...restChain] = categoryChain;
    const matchedCategory = categories.find((item) => item.name === currentCategoryName);
    if (!matchedCategory) {
      return undefined;
    }

    if (restChain.length === 0) {
      return matchedCategory.id;
    }

    return this.findIdByCategoryChain(restChain, matchedCategory.child);
  };

  static findCategoryChainById = (
    categories: BlogCategory[] | undefined,
    id: string | undefined,
  ): string[] => {
    if (!categories || !id) return [];

    for (let index = 0; index < categories.length; index += 1) {
      const currentCategory = categories[index];
      if (currentCategory.id === id) {
        return [currentCategory.name];
      }
      const childChain = this.findCategoryChainById(currentCategory.child, id);
      if (childChain.length > 0) {
        return [currentCategory.name, ...childChain];
      }
    }
    return [];
  };
}
