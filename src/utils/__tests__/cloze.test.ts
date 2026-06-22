/**
 * cloze.ts — parseCloze / clozeMarkerIds 단위 테스트.
 *
 * oksolve src/lib/cloze.ts 의 1:1 포팅본이므로 마커 규약({{blankId}})·세그먼트 분해·
 * id 수집을 빠짐없이 검증한다. 채점 로직은 서버 담당이라 여기서 다루지 않는다.
 */
import { describe, expect, it } from 'vitest';
import { parseCloze, clozeMarkerIds } from '@utils/cloze';

describe('parseCloze', () => {
  it('마커가 없으면 단일 text 세그먼트', () => {
    expect(parseCloze('plain text only')).toEqual([{ kind: 'text', value: 'plain text only' }]);
  });

  it('빈 문자열은 빈 배열', () => {
    expect(parseCloze('')).toEqual([]);
  });

  it('text + blank + text 순서로 분해한다', () => {
    expect(parseCloze('x = {{b1}};')).toEqual([
      { kind: 'text', value: 'x = ' },
      { kind: 'blank', blankId: 'b1' },
      { kind: 'text', value: ';' },
    ]);
  });

  it('선두 마커는 앞 text 세그먼트를 만들지 않는다', () => {
    expect(parseCloze('{{b1}} rest')).toEqual([
      { kind: 'blank', blankId: 'b1' },
      { kind: 'text', value: ' rest' },
    ]);
  });

  it('연속 마커 사이 빈 텍스트는 생략한다', () => {
    expect(parseCloze('{{b1}}{{b2}}')).toEqual([
      { kind: 'blank', blankId: 'b1' },
      { kind: 'blank', blankId: 'b2' },
    ]);
  });

  it('여러 빈칸이 섞인 코드 템플릿을 정확히 분해한다', () => {
    expect(parseCloze('System.out.{{m}}(x); return {{v}};')).toEqual([
      { kind: 'text', value: 'System.out.' },
      { kind: 'blank', blankId: 'm' },
      { kind: 'text', value: '(x); return ' },
      { kind: 'blank', blankId: 'v' },
      { kind: 'text', value: ';' },
    ]);
  });

  it('blankId 에 언더스코어/숫자 허용', () => {
    expect(parseCloze('{{blank_1}}')).toEqual([{ kind: 'blank', blankId: 'blank_1' }]);
  });

  it('단일 중괄호는 마커가 아니라 텍스트로 취급한다', () => {
    // 일반 코드의 단일 { 와 충돌하지 않아야 한다.
    expect(parseCloze('if (x) { return {{r}}; }')).toEqual([
      { kind: 'text', value: 'if (x) { return ' },
      { kind: 'blank', blankId: 'r' },
      { kind: 'text', value: '; }' },
    ]);
  });

  it('연속 호출에도 결과가 안정적이다(lastIndex 공유 방어)', () => {
    const t = 'a {{b1}} c';
    const first = parseCloze(t);
    const second = parseCloze(t);
    expect(first).toEqual(second);
  });

  it('개행을 포함한 멀티라인 템플릿을 보존한다', () => {
    expect(parseCloze('line1\n{{b1}}\nline2')).toEqual([
      { kind: 'text', value: 'line1\n' },
      { kind: 'blank', blankId: 'b1' },
      { kind: 'text', value: '\nline2' },
    ]);
  });
});

describe('clozeMarkerIds', () => {
  it('템플릿의 모든 마커 id 를 순서대로 수집한다', () => {
    expect(clozeMarkerIds('{{a}} x {{b}} y {{c}}')).toEqual(['a', 'b', 'c']);
  });

  it('마커가 없으면 빈 배열', () => {
    expect(clozeMarkerIds('no markers here')).toEqual([]);
  });

  it('중복 마커 id 도 등장 순서대로 모두 포함한다', () => {
    expect(clozeMarkerIds('{{a}}{{a}}')).toEqual(['a', 'a']);
  });

  it('연속 호출에도 안정적이다', () => {
    expect(clozeMarkerIds('{{x}}{{y}}')).toEqual(['x', 'y']);
    expect(clozeMarkerIds('{{x}}{{y}}')).toEqual(['x', 'y']);
  });
});
