import { TodoStoreState } from '@stores/TodoStore/type';
import { PercentStoreState } from '@stores/PercentStore/type';

export interface Store {
  todoStore: TodoStoreState;
  percentStore: PercentStoreState;
}
