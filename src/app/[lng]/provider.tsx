'use client';

import React, { ReactNode } from 'react';

import stores from '@stores';
import { StoreContext } from '@context/storeContext';
import RouteChangeTracker from '@components/analytics/RouteChangeTracker';

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <StoreContext.Provider value={stores}>
      <RouteChangeTracker />
      {children}
    </StoreContext.Provider>
  );
}
