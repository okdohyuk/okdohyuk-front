import { blogApi } from '~/spec/api';
import { PostBlogCategoryRequest } from '~/spec/api/Blog';
import { UseCategoryProps } from './type';

const useBlogCategory = () => {
  const post = async ({ category, parent }: UseCategoryProps) => {
    if (category.trim() === '') throw new Error();

    const postdata: PostBlogCategoryRequest = {
      name: category,
      parentId: parent !== null ? parent.id : undefined,
    };

    await blogApi.postBlogCategory('', postdata);
  };

  const patch = async ({ parent }: UseCategoryProps) => {
    if (!(parent && parent.id && parent.name)) return;

    const postdata: PostBlogCategoryRequest = {
      name: parent.name,
    };

    await blogApi.patchBlogCategoryId(parent.id, '', postdata);
  };

  const remove = async ({ parent }: UseCategoryProps) => {
    if (!(parent && parent.id && parent.name)) return;
    if (!window.confirm('정말 삭제 하시겠습니까?')) return;

    await blogApi.deleteBlogCategoryId(parent.id, '');
  };

  return { post, patch, remove };
};

export default useBlogCategory;
