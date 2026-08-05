import React from 'react';
import { SERVICE_SECTION_ORDER } from '@assets/datas/serviceCategories';
import { SERVICE_TOOL_COUNT } from '@assets/datas/landingShowcase';
import { LandingCopy } from '@libs/server/landingCopy';
import LandingCountUp from './LandingCountUp';

type LandingHeroStatsProps = {
  stats: LandingCopy['stats'];
};

/**
 * 선행 정수 + 나머지(단위)를 분리한다.
 *
 * 지원 언어 값은 로케일마다 "4" / "4개" / "4 种" 으로 다르고, 회원가입 값("불필요")처럼
 * 아예 숫자가 아닌 항목도 있다. i18n 키를 숫자/단위로 쪼개는 대신 여기서 한 번 해석해,
 * **숫자가 있으면 카운트업하고 없으면 문자열 그대로** 둔다.
 */
function splitLeadingNumber(text: string): { value: number; suffix: string } | null {
  const matched = /^(\d+)([\s\S]*)$/.exec(text.trim());
  if (!matched) return null;
  return { value: Number(matched[1]), suffix: matched[2] };
}

type StatItem = { key: string; label: string; value: number | null; suffix: string; text: string };

/** 히어로 씬의 지표 4칸. 서버 컴포넌트 — 값은 메뉴 데이터에서 실측한다. */
export default function LandingHeroStats({ stats }: LandingHeroStatsProps) {
  const numeric = (key: string, label: string, value: number, suffix: string): StatItem => ({
    key,
    label,
    value,
    suffix,
    text: `${value}${suffix}`,
  });

  const languages = splitLeadingNumber(stats.languagesValue);

  const items: StatItem[] = [
    numeric('tools', stats.toolsLabel, SERVICE_TOOL_COUNT, '+'),
    numeric('categories', stats.categoriesLabel, SERVICE_SECTION_ORDER.length, ''),
    languages
      ? numeric('languages', stats.languagesLabel, languages.value, languages.suffix)
      : {
          key: 'languages',
          label: stats.languagesLabel,
          value: null,
          suffix: '',
          text: stats.languagesValue,
        },
    // "불필요" 처럼 수치가 아닌 항목은 카운트업 대상이 아니다.
    { key: 'login', label: stats.loginLabel, value: null, suffix: '', text: stats.loginValue },
  ];

  return (
    <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-basic-3/70 bg-basic-3/60 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.key} className="bg-basic-0/80 px-5 py-5 backdrop-blur-xl">
          <dt className="text-xs font-medium tracking-[0.04em] text-fg-5">{item.label}</dt>
          <dd className="mt-2 text-[clamp(1.3rem,2.4vw,1.75rem)] font-extrabold tracking-[-0.03em] text-fg-1">
            {item.value === null ? (
              item.text
            ) : (
              <LandingCountUp value={item.value} suffix={item.suffix} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
