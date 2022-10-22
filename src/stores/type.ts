import { TodoStoreState } from '@stores/TodoStore/type';
import { PercentStoreState } from '@stores/PercentStore/type';
import { BlogStoreState } from '@stores/BlogStore/type';

export interface Store {
  todoStore: TodoStoreState;
  percentStore: PercentStoreState;
  blogStore: BlogStoreState;
}
