export type RewardedAdStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'showing'
  | 'granted'
  | 'unavailable'
  | 'cancelled';

type Slot = { addService: (service: PubAds) => void };
type AdEvent = {
  slot: Slot;
  isEmpty?: boolean;
  makeRewardedVisible?: () => boolean;
};
type Listener = (event: AdEvent) => void;
type PubAds = {
  addEventListener: (name: string, listener: Listener) => void;
  removeEventListener: (name: string, listener: Listener) => void;
};
type Gpt = {
  cmd: { push: (callback: () => void) => unknown };
  enums: { OutOfPageFormat: { REWARDED: unknown } };
  defineOutOfPageSlot: (unit: string, format: unknown) => Slot | null;
  pubads: () => PubAds;
  enableServices: () => void;
  display: (slot: Slot) => void;
  destroySlots: (slots: Slot[]) => void;
};
type RewardedWindow = Window & { googletag?: Gpt };

export type RewardedAdAttempt = { show: () => void; cancel: () => void };

const GPT_SRC = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
const SCRIPT_ID = 'short-url-rewarded-gpt';
const LOAD_TIMEOUT_MS = 15000;
// GPT does not allow concurrent rewarded-ad requests on one page.
let activeAttempt: RewardedAdAttempt | null = null;

/** Reward only on Google's grant event, delivered after its close event. No timers grant rewards. */
export function prepareRewardedAd(
  unit: string,
  onStatus: (status: RewardedAdStatus) => void,
): RewardedAdAttempt {
  let disposed = false;
  let showing = false;
  let granted = false;
  let slot: Slot | null = null;
  let pubads: PubAds | null = null;
  let gpt: Gpt | undefined;
  let readyEvent: AdEvent | null = null;
  let script: HTMLScriptElement | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners: Array<[string, Listener]> = [];

  let onScriptError: () => void;
  let attempt: RewardedAdAttempt;

  const cleanup = () => {
    clearTimeout(timer);
    script?.removeEventListener('error', onScriptError);
    readyEvent = null;
    if (activeAttempt === attempt) activeAttempt = null;
    if (pubads) {
      listeners.forEach(([name, listener]) => pubads?.removeEventListener(name, listener));
    }
    if (slot) gpt?.destroySlots([slot]);
  };

  const finish = (status: RewardedAdStatus) => {
    if (disposed) return;
    disposed = true;
    try {
      cleanup();
    } catch {
      // SDK cleanup failure must not strand the form in its loading state.
    }
    onStatus(status);
  };

  onScriptError = () => {
    if (script?.id === SCRIPT_ID) script.remove();
    finish('unavailable');
  };

  attempt = {
    show: () => {
      if (disposed || showing || !readyEvent?.makeRewardedVisible) return;
      // Mark showing first: GPT can deliver events synchronously from makeRewardedVisible.
      showing = true;
      onStatus('showing');
      try {
        if (!readyEvent.makeRewardedVisible()) finish('unavailable');
      } catch {
        finish('unavailable');
      }
    },
    cancel: () => finish('cancelled'),
  };

  if (typeof window === 'undefined' || !/^\/\d+\/.+/.test(unit) || activeAttempt) {
    disposed = true;
    onStatus('unavailable');
    return attempt;
  }
  activeAttempt = attempt;
  onStatus('loading');
  timer = setTimeout(() => {
    if (!slot && script?.id === SCRIPT_ID) script.remove();
    finish('unavailable');
  }, LOAD_TIMEOUT_MS);

  const adWindow = window as RewardedWindow;
  adWindow.googletag = adWindow.googletag || ({ cmd: [] } as unknown as Gpt);
  gpt = adWindow.googletag;

  script = document.querySelector<HTMLScriptElement>(`script[src="${GPT_SRC}"]`);
  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = GPT_SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.addEventListener('error', onScriptError);
    document.head.appendChild(script);
  } else {
    script.addEventListener('error', onScriptError);
  }

  gpt.cmd.push(() => {
    if (disposed) return;
    try {
      // The script can replace the bootstrap queue object when loading completes.
      gpt = adWindow.googletag;
      if (!gpt) {
        finish('unavailable');
        return;
      }
      slot = gpt.defineOutOfPageSlot(unit, gpt.enums.OutOfPageFormat.REWARDED);
      if (!slot) {
        finish('unavailable');
        return;
      }
      pubads = gpt.pubads();
      slot.addService(pubads);
      const listen = (name: string, callback: Listener) => {
        const listener: Listener = (event) => {
          if (!disposed && event.slot === slot) callback(event);
        };
        listeners.push([name, listener]);
        pubads?.addEventListener(name, listener);
      };
      listen('rewardedSlotReady', (event) => {
        if (readyEvent || showing) return;
        clearTimeout(timer);
        readyEvent = event;
        onStatus('ready');
      });
      listen('rewardedSlotGranted', () => {
        if (showing) granted = true;
      });
      listen('rewardedSlotClosed', () => finish(granted ? 'granted' : 'cancelled'));
      listen('slotRenderEnded', (event) => {
        if (event.isEmpty) finish('unavailable');
      });
      gpt.enableServices();
      gpt.display(slot);
    } catch {
      finish('unavailable');
    }
  });

  return attempt;
}
