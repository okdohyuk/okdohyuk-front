import { useContext } from 'react';
import { Store } from '@stores/type';
import { StoreContext } from '@context/storeContext';

function useStore<K extends keyof Store>(key: K): Store[K] {
  const mobXStore = useContext(StoreContext);
  return mobXStore[key];
}

export default useStore;
