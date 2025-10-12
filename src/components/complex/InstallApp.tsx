'use client';

import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

type InstallAppProps = {
  text: string;
};

function InstallApp({ text }: InstallAppProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<null | BeforeInstallPromptEvent>(null);

  useEffect(() => {
    const handler = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    });
  };

  if (!deferredPrompt) return null;

  return (
    <button
      type="button"
      className="absolute top-[16px] right-[16px] underline dark:text-white"
      onClick={installApp}
    >
      {text}
    </button>
  );
}

export default InstallApp;
