'use client';

/* eslint-disable react/require-default-props */

import React, { useEffect, useMemo, useState } from 'react';
import type { PresentationSession } from '@api/Presentation';
import { PresentationSessionStatus } from '@api/Presentation';
import { cn } from '@utils/cn';

interface PresentationTimerProps {
  session: PresentationSession;
  className?: string;
}

const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  return [hours, minutes, remainder].map((value) => String(value).padStart(2, '0')).join(':');
};

export default function PresentationTimer({ session, className }: PresentationTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const [receivedAt, setReceivedAt] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setReceivedAt(Date.now());
  }, [session.elapsedSeconds, session.serverTime, session.status]);

  const elapsed = useMemo(() => {
    const extra =
      session.status === PresentationSessionStatus.Running
        ? Math.max(0, Math.floor((now - receivedAt) / 1000))
        : 0;
    return session.elapsedSeconds + extra;
  }, [now, receivedAt, session.elapsedSeconds, session.status]);

  const remaining = Math.max(0, session.targetDurationSeconds - elapsed);
  const hasTarget = session.targetDurationSeconds > 0;

  return (
    <div className={cn('tabular-nums', className)} aria-live="polite">
      <span className="font-semibold">{formatDuration(elapsed)}</span>
      {hasTarget ? (
        <span className="ml-2 text-xs text-fg-5">/ {formatDuration(remaining)} left</span>
      ) : null}
    </div>
  );
}

export { formatDuration };
