'use client';

import { useEffect, useState } from 'react';

const MAC_PLATFORM_PATTERN = /Mac|iPhone|iPad|iPod/i;
const MAC_LABEL = '⌘K';
const OTHER_LABEL = 'Ctrl K';

/**
 * Label for the command-palette shortcut: `⌘K` on Apple platforms, `Ctrl K` elsewhere.
 * SSR (and the first client render) returns `⌘K` so hydration matches; non-Apple platforms
 * switch after mount.
 */
export default function useShortcutLabel(): string {
  const [label, setLabel] = useState(MAC_LABEL);

  useEffect(() => {
    if (!MAC_PLATFORM_PATTERN.test(window.navigator.userAgent)) {
      setLabel(OTHER_LABEL);
    }
  }, []);

  return label;
}
