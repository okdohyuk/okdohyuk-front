import { Blog, BlogCategory, BlogRequest } from '~/spec/api/Blog';

export default class BlogUtils {
  static toBlogRequest(blog: Blog, category: BlogCategory[]): BlogRequest {
    return {
      ...blog,
      categoryId: this.findIdByCategoryChain(blog.categoryChain, category),
    };
  }

  static findIdByCategoryChain = (
    categoryChain: string[] | undefined,
    category: BlogCategory[] | undefined,
  ): string | undefined => {
    if (!categoryChain || !category) return;
    const currentCategory = category.find((category) => category.name === categoryChain[0]);
    if (!currentCategory) return;
    if (categoryChain.length === 1) return currentCategory.id;
    return this.findIdByCategoryChain(categoryChain.slice(1), currentCategory.child);
  };

  static findCategoryChainById = (
    category: BlogCategory[] | undefined,
    id: string | undefined,
  ): string[] => {
    if (!category || !id) return [];
    for (const currentCategory of category) {
      if (currentCategory.id === id) return [currentCategory.name];
      const childChain = this.findCategoryChainById(currentCategory.child, id);
      if (childChain.length > 0) return [currentCategory.name, ...childChain];
    }
    return [];
  };
}
