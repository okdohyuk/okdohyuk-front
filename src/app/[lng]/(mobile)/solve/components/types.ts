/*
 * solve/types.ts — solve 도메인 표현 컴포넌트 공용 타입.
 *
 * 채점 결과 타입은 generated `@api/Solve` 모델을 단일 진실 공급원으로 삼는다.
 * `ChoiceIndex`만 UI 표현용으로 1~4로 좁힌 별도 타입을 유지한다(①②③④ 배지 매핑).
 */

import type { SolveBlankResult, SolveQuestionType as GeneratedSolveQuestionType } from '@api/Solve';

/** MCQ 선택지 인덱스(1-based). UI 표현용 narrowing. */
export type ChoiceIndex = 1 | 2 | 3 | 4;

/** 문항 유형 판별자. generated spec enum 값과 동일('mcq' | 'short' | 'cloze'). */
export type SolveQuestionType = GeneratedSolveQuestionType;

/** 채점 후 단일 빈칸 결과. generated `SolveBlankResult`와 동일 형태(별칭). */
export type BlankResult = SolveBlankResult;
