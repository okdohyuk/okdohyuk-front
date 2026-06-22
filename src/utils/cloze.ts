/*
 * cloze.ts — 코드/지문 빈칸 템플릿 파서 (oksolve src/lib/cloze.ts 포팅, 렌더 전용).
 *
 * 마커 규약: {{blankId}} (이중 중괄호). blankId는 영숫자+언더스코어만 허용.
 * 채점은 백엔드가 하므로 grade 관련 로직은 포팅하지 않는다(렌더용 parse/markerIds만).
 *
 * NOTE(ui-component-designer): solve/ClozeBlock이 직접 의존하므로 컴파일·Storybook을 위해
 * 이 파일을 생성했다. 계획서 §4.4상 이 유틸의 owner는 nextjs-frontend-engineer이며,
 * 시그니처는 그대로 유지하면 된다(아래 export 2개).
 */

// 전역 플래그 정규식 — 호출마다 새 RegExp를 만들어 lastIndex 공유를 피한다.
const CLOZE_MARKER = /\{\{([A-Za-z0-9_]+)\}\}/g;

export type ClozeSegment = { kind: 'text'; value: string } | { kind: 'blank'; blankId: string };

/** 템플릿을 텍스트/빈칸 세그먼트 배열로 분해한다. 마커 사이 빈 텍스트는 생략. */
export function parseCloze(template: string): ClozeSegment[] {
  const segments: ClozeSegment[] = [];
  let lastIndex = 0;
  const re = new RegExp(CLOZE_MARKER.source, 'g');
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(template)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ kind: 'text', value: template.slice(lastIndex, m.index) });
    }
    segments.push({ kind: 'blank', blankId: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < template.length) {
    segments.push({ kind: 'text', value: template.slice(lastIndex) });
  }
  return segments;
}

/** 템플릿에 등장하는 마커 id 집합. blanks[].id 일치 검증에 쓴다. */
export function clozeMarkerIds(template: string): string[] {
  const ids: string[] = [];
  const re = new RegExp(CLOZE_MARKER.source, 'g');
  let m: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(template)) !== null) ids.push(m[1]);
  return ids;
}
