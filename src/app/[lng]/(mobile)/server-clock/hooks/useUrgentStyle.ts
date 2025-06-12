'use client';

import { useEffect, useState } from 'react';
import { TargetAndTransition } from 'framer-motion';

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const interpolate = (start: number, end: number, factor: number): number =>
  Math.round(start + factor * (end - start));

export function useUrgentStyle(serverTime: Date | null) {
  const [urgentStyle, setUrgentStyle] = useState<TargetAndTransition>({
    color: 'inherit',
    scale: 1,
  });

  useEffect(() => {
    if (serverTime) {
      const minutes = serverTime.getMinutes();
      const seconds = serverTime.getSeconds();
      const milliseconds = serverTime.getMilliseconds();

      if (minutes === 59 && seconds >= 50) {
        const progress = ((seconds - 50) * 1000 + milliseconds) / 10000;
        const clampedProgress = Math.max(0, Math.min(1, progress));

        const isDarkMode = document.documentElement.classList.contains('dark');
        const startColorHex = isDarkMode ? '#FFFFFF' : '#111827';
        const endColorHex = '#EF4444';

        const startRgb = hexToRgb(startColorHex);
        const endRgb = hexToRgb(endColorHex);

        if (startRgb && endRgb) {
          const r = interpolate(startRgb.r, endRgb.r, clampedProgress);
          const g = interpolate(startRgb.g, endRgb.g, clampedProgress);
          const b = interpolate(startRgb.b, endRgb.b, clampedProgress);

          setUrgentStyle({
            color: `rgb(${r}, ${g}, ${b})`,
            scale: 1 + 0.05 * clampedProgress,
          });
        }
      } else {
        setUrgentStyle({ color: 'inherit', scale: 1 });
      }
    } else {
      setUrgentStyle({ color: 'inherit', scale: 1 });
    }
  }, [serverTime]);

  return urgentStyle;
}
