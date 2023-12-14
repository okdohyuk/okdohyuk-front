import { AuthApi } from './Auth';
import { BlogApi } from './Blog';
import { UserApi } from './User';

export const blogApi = new BlogApi();
export const userApi = new UserApi();
export const authApi = new AuthApi();
