'use client';

import React, { ReactNode } from 'react';

import { Provider } from 'mobx-react';
import stores from '@stores';

export function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider {...stores}>{children}</Provider>;
}
