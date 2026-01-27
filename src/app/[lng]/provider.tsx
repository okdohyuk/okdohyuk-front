'use client';

import React, { ReactNode } from 'react';

import stores from '@stores';
import { StoreContext } from '@context/storeContext';

export function StoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext.Provider value={stores}>{children}</StoreContext.Provider>;
}
