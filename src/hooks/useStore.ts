import { useContext } from 'react';
import { MobXProviderContext } from 'mobx-react';
import { Store } from '@stores/type';

function useStore<T>(key: keyof Store): T {
  const mobXStore = useContext(MobXProviderContext) as Store;
  return mobXStore[key] as unknown as T;
}

export default useStore;
