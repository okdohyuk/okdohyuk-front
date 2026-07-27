'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@components/basic/Button/Button';
import { Textarea } from '@components/basic/Textarea/Textarea';
import { sendGAEvent } from '@libs/client/gtag';
import { surveyApi } from '@api';
import UserTokenUtil from '@utils/userTokenUtil';
import LocalStorage from '@utils/localStorage';
import logger from '@utils/logger';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

// 재방문 트리거 파라미터
const MIN_VISITS = 2; // 2회차 방문부터 노출
const VISIT_COUNT_KEY = 'survey_visit_count'; // localStorage 누적 방문 수
const VISIT_SESSION_FLAG = 'survey_visit_counted'; // sessionStorage: 탭 세션당 1회만 카운트
const STATE_KEY = 'survey_state_v1'; // localStorage: 응답/닫음 상태 + timestamp

// 상태별 TTL. 응답은 장기간 재노출 차단, 닫음은 비교적 짧게 두어 재문의 여지를 남긴다.
const DAY_MS = 24 * 60 * 60 * 1000;
const RESPONDED_TTL_MS = 180 * DAY_MS;
const DISMISSED_TTL_MS = 30 * DAY_MS;

const THANKS_AUTO_HIDE_MS = 1600;
const MAX_COMMENT_LENGTH = 500;
const NPS_SCORES = Array.from({ length: 11 }, (_, i) => i); // 0~10

type SurveyStatus = 'responded' | 'dismissed';

type StoredSurveyState = {
  status: SurveyStatus;
  at: number;
};

function ttlFor(status: SurveyStatus): number {
  return status === 'responded' ? RESPONDED_TTL_MS : DISMISSED_TTL_MS;
}

// 저장된 응답/닫음 상태를 읽고, TTL 만료 시 제거 후 null 반환 (ConsentBanner TTL 패턴)
function readSurveyState(): StoredSurveyState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = LocalStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSurveyState;
    const validStatus = parsed?.status === 'responded' || parsed?.status === 'dismissed';
    if (!validStatus || typeof parsed?.at !== 'number') return null;
    if (Date.now() - parsed.at > ttlFor(parsed.status)) {
      LocalStorage.removeItem(STATE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSurveyState(status: SurveyStatus) {
  try {
    const payload: StoredSurveyState = { status, at: Date.now() };
    LocalStorage.setItem(STATE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage 사용 불가 환경 — 무시
  }
}

// 탭 세션당 1회만 카운트를 올려 "방문 횟수"를 근사한다.
// SessionId 쿠키는 재방문 전반에 걸쳐 안정적으로 유지되므로 방문 구분자로는 부적합하여
// 세션 스토리지 플래그를 방문 경계로 사용한다. (SessionId는 gtag 이벤트 상관관계로 이미 활용됨)
function registerVisit(): number {
  const current = Number(LocalStorage.getItem(VISIT_COUNT_KEY)) || 0;
  if (typeof window === 'undefined') return current;

  let alreadyCounted = false;
  try {
    alreadyCounted = window.sessionStorage.getItem(VISIT_SESSION_FLAG) === '1';
  } catch {
    // sessionStorage 사용 불가 — 카운트 유지
  }
  if (alreadyCounted) return current || 1;

  const next = current + 1;
  LocalStorage.setItem(VISIT_COUNT_KEY, String(next));
  try {
    window.sessionStorage.setItem(VISIT_SESSION_FLAG, '1');
  } catch {
    // 무시
  }
  return next;
}

export default function SurveyBanner() {
  const params = useParams<{ lng?: string }>();
  const language = (params?.lng ?? 'ko') as Language;
  const { t } = useTranslation(language, 'survey');

  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [score, setScore] = React.useState<number | null>(null);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const shownReportedRef = React.useRef(false);

  React.useEffect(() => {
    setMounted(true);
    // 이미 응답했거나 닫은 상태(TTL 내)면 노출하지 않음
    if (readSurveyState()) return;
    const visits = registerVisit();
    if (visits >= MIN_VISITS) {
      setVisible(true);
    }
  }, []);

  // 노출 시 1회만 survey_shown 계측
  React.useEffect(() => {
    if (visible && !shownReportedRef.current) {
      shownReportedRef.current = true;
      sendGAEvent('survey_shown', 'shown');
    }
  }, [visible]);

  const handleDismiss = React.useCallback(() => {
    writeSurveyState('dismissed');
    sendGAEvent('survey_dismissed', 'dismissed');
    setVisible(false);
  }, []);

  const handleSubmit = React.useCallback(async () => {
    if (score === null || submitting) return;
    setSubmitting(true);
    const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
    // 로그인 상태면 토큰 전달, 없으면 익명(undefined). apiInstance 인터셉터도 토큰을 자동 첨부한다.
    const authorization = UserTokenUtil.getAccessToken() || undefined;
    const trimmed = comment.trim();
    try {
      await surveyApi.postSurvey(
        {
          npsScore: score,
          comment: trimmed || null,
          language,
          pagePath,
        },
        authorization,
      );
      writeSurveyState('responded');
      sendGAEvent('survey_submitted', String(score), { npsScore: score });
      setDone(true);
      window.setTimeout(() => setVisible(false), THANKS_AUTO_HIDE_MS);
    } catch (err) {
      logger.error('SurveyBanner: 설문 제출 실패', err);
      setSubmitting(false);
    }
  }, [score, comment, language, submitting]);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t('ariaLabel')}
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:pb-6"
    >
      <div className="w-full max-w-xl rounded-2xl border border-basic-3 bg-basic-0 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:p-5">
        {done ? (
          <p className="py-2 text-center text-sm text-fg-1 sm:text-base">{t('thanks')}</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-fg-1">{t('title')}</p>
                <p className="mt-1 text-sm text-fg-2">{t('description')}</p>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label={t('dismissAriaLabel')}
                className="shrink-0 rounded-md p-1 text-fg-3 transition-colors hover:bg-basic-2 hover:text-fg-1"
              >
                <span aria-hidden>✕</span>
              </button>
            </div>

            <p className="mt-3 text-sm text-fg-1">{t('npsQuestion')}</p>
            <div
              role="radiogroup"
              aria-label={t('npsQuestion')}
              className="mt-2 flex flex-wrap gap-1"
            >
              {NPS_SCORES.map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={score === n}
                  aria-label={t('scoreAriaLabel', { score: n })}
                  onClick={() => setScore(n)}
                  className={cn(
                    'h-9 min-w-9 flex-1 rounded-md border text-sm transition-colors',
                    score === n
                      ? 'border-point-2 bg-point-2 text-white'
                      : 'border-basic-3 bg-basic-1 text-fg-1 hover:border-point-2 hover:bg-basic-2',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs text-fg-3">
              <span>{t('npsLow')}</span>
              <span>{t('npsHigh')}</span>
            </div>

            <Textarea
              className="mt-3"
              rows={2}
              value={comment}
              maxLength={MAX_COMMENT_LENGTH}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
            />

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={handleDismiss}
                className="bg-basic-2 text-fg-1 hover:bg-basic-3"
                aria-label={t('dismissAriaLabel')}
              >
                {t('dismiss')}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={score === null || submitting}
                aria-label={t('submitAriaLabel')}
              >
                {t('submit')}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
