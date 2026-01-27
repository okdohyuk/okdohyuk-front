import { createContext } from 'react';
import { Store } from '@stores/type';

export const StoreContext = createContext<Store>({} as Store);
