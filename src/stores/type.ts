import { TodoStoreState } from '@stores/TodoStore/type';
import { PercentStoreState } from '@stores/PercentStore/type';
import { BlogStoreState } from '@stores/BlogStore/type';
import { UserStoreState } from '@stores/UserStore/type';

export interface Store {
  todoStore: TodoStoreState;
  percentStore: PercentStoreState;
  blogStore: BlogStoreState;
  userStore: UserStoreState;
}
