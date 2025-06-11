// 서버 시간 API 타입 및 react-query 훅 정의 파일
// 기존 타입 선언 파일이 없으므로 여기서 타입 정의 (추후 types 폴더로 이동 가능)

import { useQuery } from '@tanstack/react-query';

export interface ServerTimeResponse {
  serverTimeISO: string;
  serverTimeMillis: number;
}

// 서버 시간 fetch 함수
export async function fetchServerTime(targetSite: string): Promise<ServerTimeResponse> {
  const res = await fetch(`/api/v1/server-time/${targetSite}`);
  if (!res.ok) throw new Error('fetchError');
  return res.json();
}

// react-query 전용 훅
export function useServerTimeQuery(targetSite: string, enabled = true) {
  return useQuery<ServerTimeResponse, Error>({
    queryKey: ['server-time', targetSite],
    queryFn: () => fetchServerTime(targetSite),
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    retry: 1,
  });
}
