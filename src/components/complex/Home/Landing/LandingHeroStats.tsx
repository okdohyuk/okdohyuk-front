/* eslint-disable react/require-default-props */

import React from 'react';
import { SERVICE_SECTION_ORDER } from '@assets/datas/serviceCategories';
import { SERVICE_TOOL_COUNT } from '@assets/datas/landingShowcase';
import { LandingCopy } from '@libs/server/landingCopy';
import { cn } from '@utils/cn';

type LandingHeroStatsProps = {
  stats: LandingCopy['stats'];
  /** 지원 언어 이름 나열 ("한국어 · English · 日本語 · 中文") */
  languages: string;
  className?: string;
};

type StatItem = { key: string; label: string; value: string; kind: 'key' | 'figure' | 'text' };

const VALUE_CLASS: Record<StatItem['kind'], string> = {
  // 화면에서 가장 중요한 숫자 하나만 강조색(텍스트용 진한 톤)으로 둔다.
  key: 'text-3xl text-point-fg',
  figure: 'text-3xl text-fg-1',
  text: 'text-sm leading-5 text-fg-3',
};

/**
 * 히어로 지표 줄. 서버 컴포넌트 — 수치는 메뉴 데이터에서 센다(문구에 박지 않는다).
 * 카드·글래스 없이 라벨 + 값만, 값의 종류에 따라 크기를 달리해 리듬을 만든다.
 */
export default function LandingHeroStats({ stats, languages, className }: LandingHeroStatsProps) {
  const items: StatItem[] = [
    { key: 'tools', label: stats.toolsLabel, value: String(SERVICE_TOOL_COUNT), kind: 'key' },
    {
      key: 'categories',
      label: stats.categoriesLabel,
      value: String(SERVICE_SECTION_ORDER.length),
      kind: 'figure',
    },
    { key: 'login', label: stats.loginLabel, value: stats.loginValue, kind: 'text' },
    { key: 'languages', label: stats.languagesLabel, value: languages, kind: 'text' },
  ];

  return (
    <dl
      className={cn(
        // 모바일(2열): 칸마다 라벨 위·값 아래, 같은 줄의 값은 종류가 같아 아랫선이 자연히 맞는다.
        // sm 이상(한 줄): 칸 래퍼를 contents 로 풀어 dt/dd 를 2행 그리드에 직접 올리고,
        // 값 행 전체를 마지막 baseline 에 맞춘다 — 큰 숫자와 작은 텍스트 값이 한 기준선에 선다.
        'grid grid-cols-2 gap-x-8 gap-y-6 border-t border-basic-3 pt-6',
        'sm:grid-flow-col sm:grid-cols-[auto_auto_auto_1fr] sm:grid-rows-[auto_auto] sm:items-baseline-last sm:gap-x-10 sm:gap-y-2',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.key} className="flex min-w-0 flex-col justify-between gap-2 sm:contents">
          <dt className="text-xs leading-4 text-fg-5">{item.label}</dt>
          <dd
            className={cn(
              'min-w-0 font-medium tabular-nums [word-break:keep-all]',
              item.kind !== 'text' && 'font-mono leading-none',
              VALUE_CLASS[item.kind],
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
