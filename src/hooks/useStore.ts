import React from 'react';
import { MobXProviderContext } from 'mobx-react';
import { Store } from '@stores/type';

function useStore(store: keyof Store) {
  return React.useContext(MobXProviderContext)[store];
}

export default useStore;
