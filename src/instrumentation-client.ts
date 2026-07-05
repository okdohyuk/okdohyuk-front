// This file configures client-side Sentry initialization.
// Keep it opt-in to avoid forcing monitoring/replay code into the critical path.

type SentryModule = typeof import('@sentry/nextjs');

const sentryEnabled =
  process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

const replayEnabled = process.env.NEXT_PUBLIC_ENABLE_SENTRY_REPLAY === 'true';

// 지속 관찰이 불필요한 노이즈 이벤트를 전송 전에 걸러낸다.
// ⚠️ AdSense TagError(availableWidth 등)는 노출 회귀 감시를 위해 계속 수집한다(여기서 거르지 않음).
type NoiseFrame = { function?: string };
type NoiseEvent = {
  exception?: { values?: Array<{ value?: string; stacktrace?: { frames?: NoiseFrame[] } }> };
};

// 인앱 WebView(번역/제스처 오버레이)가 주입한 스크립트의 함수 시그니처. 우리 코드에 존재하지 않는다.
const INJECTED_SCRIPT_FUNCTIONS = [
  'hit_swipe_element',
  'check_swipe_element',
  'hit_test',
  'is_mark_able_element',
];

const isNoiseEvent = (event: NoiseEvent): boolean => {
  const exception = event.exception?.values?.[0];
  const message = exception?.value ?? '';
  const frames = exception?.stacktrace?.frames ?? [];

  // 1) 인앱 WebView 주입 스크립트 오류 (FRONT-26/27): 특정 기기 오버레이가 던지는 것으로 우리 코드 아님.
  if (
    frames.some((frame) => frame.function && INJECTED_SCRIPT_FUNCTIONS.includes(frame.function))
  ) {
    return true;
  }

  // 2) 서드파티 애널리틱스 비콘의 네트워크 실패 (FRONT-20~24): 애드블록/오프라인 등 액션 불가.
  if (
    /Failed to fetch|Load failed|NetworkError/i.test(message) &&
    /(google-analytics|googletagmanager|analytics\.google|googlesyndication)\.com/i.test(message)
  ) {
    return true;
  }

  // 3) 기대된 4xx 응답 (FRONT-1J 404, FRONT-3 만료 단축 URL 410): 정상 흐름.
  if (/Request failed with status code (404|410)/.test(message)) {
    return true;
  }

  return false;
};

const beforeSend = <T extends NoiseEvent>(event: T): T | null =>
  isNoiseEvent(event) ? null : event;

let sentryModulePromise: Promise<SentryModule> | null = null;

const getSentryModule = async () => {
  if (!sentryModulePromise) {
    sentryModulePromise = import('@sentry/nextjs');
  }

  return sentryModulePromise;
};

if (sentryEnabled) {
  // eslint-disable-next-line no-void
  void getSentryModule().then((Sentry) => {
    const baseConfig = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tunnel: '/api/monitoring',
      tracesSampleRate: 0.2,
      enableLogs: false,
      sendDefaultPii: true,
      beforeSend,
    };

    if (replayEnabled) {
      Sentry.init({
        ...baseConfig,
        integrations: [Sentry.replayIntegration()],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      return;
    }

    Sentry.init({
      ...baseConfig,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  });
}

export const onRouterTransitionStart = (...args: unknown[]) => {
  if (!sentryEnabled) {
    return;
  }

  // eslint-disable-next-line no-void
  void getSentryModule().then((Sentry) => {
    const captureRouterTransitionStart = Sentry.captureRouterTransitionStart as (
      ...transitionArgs: unknown[]
    ) => void;

    captureRouterTransitionStart(...args);
  });
};
