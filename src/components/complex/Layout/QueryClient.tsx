'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode, useRef } from 'react';

// QueryClientProvider 래퍼 컴포넌트
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // QueryClient 인스턴스를 ref로 보존 (리렌더링 방지)
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }
  return <QueryClientProvider client={queryClientRef.current}>{children}</QueryClientProvider>;
}
