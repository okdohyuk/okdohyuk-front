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
}
