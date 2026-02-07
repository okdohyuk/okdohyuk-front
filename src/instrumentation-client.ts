// This file configures client-side Sentry initialization.
// Keep it opt-in to avoid forcing monitoring/replay code into the critical path.

type SentryModule = typeof import('@sentry/nextjs');

const sentryEnabled =
  process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true' && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

const replayEnabled = process.env.NEXT_PUBLIC_ENABLE_SENTRY_REPLAY === 'true';

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
