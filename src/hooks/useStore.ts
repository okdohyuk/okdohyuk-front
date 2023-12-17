import { useContext } from 'react';
import { MobXProviderContext } from 'mobx-react';
import { Store } from '@stores/type';

function useStore<K extends keyof Store>(key: K): Store[K] {
  const mobXStore = useContext(MobXProviderContext);
  return mobXStore[key];
}

export default useStore;
