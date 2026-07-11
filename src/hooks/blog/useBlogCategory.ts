import { PostBlogCategoryRequest } from '~/spec/api/Blog';
import {
  createBlogCategory,
  deleteBlogCategory,
  updateBlogCategory,
} from '~/app/[lng]/admin/blog/category/actions';
import { UseCategoryProps } from './type';

// 카테고리 변경은 서버 액션을 경유한다 — 성공 시 서버에서
// revalidateTag('blog-search'/'blog-post')로 공개 페이지 캐시를 무효화하기 위함.
const useBlogCategory = () => {
  const post = async ({ category, parent }: UseCategoryProps) => {
    if (category.trim() === '') throw new Error();

    const postdata: PostBlogCategoryRequest = {
      name: category,
      parentId: parent !== null ? parent.id : undefined,
    };

    await createBlogCategory(postdata);
  };

  const patch = async ({ parent }: UseCategoryProps) => {
    if (!(parent && parent.id && parent.name)) return;

    await updateBlogCategory(parent.id, { name: parent.name });
  };

  const remove = async ({ parent }: UseCategoryProps) => {
    if (!(parent && parent.id && parent.name)) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm('정말 삭제 하시겠습니까?')) return;

    await deleteBlogCategory(parent.id);
  };

  return { post, patch, remove };
};

export default useBlogCategory;
