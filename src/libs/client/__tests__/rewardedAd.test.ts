import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prepareRewardedAd, RewardedAdAttempt } from '../rewardedAd';

const unit = '/1234567/short_url_reward';
let attempts: RewardedAdAttempt[];
let listeners: Map<string, (event: Record<string, unknown>) => void>;
let slot: { addService: ReturnType<typeof vi.fn> };
let gpt: ReturnType<typeof createGpt>;
function createGpt() {
  const pubads = {
    addEventListener: vi.fn((name: string, listener: (event: Record<string, unknown>) => void) =>
      listeners.set(name, listener),
    ),
    removeEventListener: vi.fn((name: string) => listeners.delete(name)),
  };
  return {
    cmd: { push: vi.fn((callback: () => void) => callback()) },
    enums: { OutOfPageFormat: { REWARDED: 'rewarded' } },
    defineOutOfPageSlot: vi.fn((): typeof slot | null => slot),
    pubads: () => pubads,
    enableServices: vi.fn(),
    display: vi.fn(),
    destroySlots: vi.fn(),
  };
}
function prepare(onStatus = vi.fn()) {
  const attempt = prepareRewardedAd(unit, onStatus);
  attempts.push(attempt);
  return attempt;
}
function emit(name: string, extra: Record<string, unknown> = {}) {
  listeners.get(name)?.({ slot, ...extra });
}

describe('Google rewarded ad lifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    attempts = [];
    listeners = new Map();
    slot = { addService: vi.fn() };
    gpt = createGpt();
    Object.assign(window, { googletag: gpt });
  });
  afterEach(() => {
    attempts.forEach((attempt) => attempt.cancel());
    document.getElementById('short-url-rewarded-gpt')?.remove();
    Reflect.deleteProperty(window, 'googletag');
    vi.useRealTimers();
  });
  it('requires explicit show and grants once only after reward and close', () => {
    const status = vi.fn();
    const attempt = prepare(status);
    const visible = vi.fn(() => true);
    emit('rewardedSlotReady', { makeRewardedVisible: visible });
    expect(status).toHaveBeenLastCalledWith('ready');
    expect(visible).not.toHaveBeenCalled();
    attempt.show();
    attempt.show();
    expect(visible).toHaveBeenCalledOnce();
    emit('rewardedSlotGranted');
    expect(status).toHaveBeenLastCalledWith('showing');
    emit('rewardedSlotClosed');
    expect(status).toHaveBeenLastCalledWith('granted');
    emit('rewardedSlotClosed');
    expect(status.mock.calls.filter(([value]) => value === 'granted')).toHaveLength(1);
    expect(gpt.destroySlots).toHaveBeenCalledWith([slot]);
    expect(listeners.size).toBe(0);
  });
  it('closing without a reward never grants even after a video ends', () => {
    const status = vi.fn();
    const attempt = prepare(status);
    emit('rewardedSlotReady', { makeRewardedVisible: () => true });
    attempt.show();
    emit('rewardedSlotVideoCompleted');
    emit('rewardedSlotClosed');
    expect(status).toHaveBeenLastCalledWith('cancelled');
    expect(status).not.toHaveBeenCalledWith('granted');
  });
  it('ignores reward events before consent and from other slots', () => {
    const status = vi.fn();
    const attempt = prepare(status);
    emit('rewardedSlotGranted');
    emit('rewardedSlotReady', { makeRewardedVisible: () => true });
    attempt.show();
    emit('rewardedSlotGranted', { slot: {} });
    emit('rewardedSlotClosed');
    expect(status).toHaveBeenLastCalledWith('cancelled');
  });
  it('handles unsupported devices and permits retry', () => {
    const status = vi.fn();
    gpt.defineOutOfPageSlot.mockReturnValueOnce(null);
    prepare(status);
    expect(status).toHaveBeenLastCalledWith('unavailable');
    prepare(status);
    expect(gpt.display).toHaveBeenCalledOnce();
  });
  it('no fill never grants a reward', () => {
    const status = vi.fn();
    prepare(status);
    emit('slotRenderEnded', { isEmpty: true });
    expect(status).toHaveBeenLastCalledWith('unavailable');
    expect(status).not.toHaveBeenCalledWith('granted');
  });
  it('times out a blocked load without granting', () => {
    const status = vi.fn();
    gpt.cmd.push.mockImplementation(() => undefined);
    prepare(status);
    vi.advanceTimersByTime(15000);
    expect(status).toHaveBeenLastCalledWith('unavailable');
    expect(status).not.toHaveBeenCalledWith('granted');
  });
  it('script failure allows reloading on retry', () => {
    const status = vi.fn();
    gpt.cmd.push.mockImplementation(() => undefined);
    prepare(status);
    document.getElementById('short-url-rewarded-gpt')?.dispatchEvent(new Event('error'));
    expect(status).toHaveBeenLastCalledWith('unavailable');
    expect(document.getElementById('short-url-rewarded-gpt')).toBeNull();
    prepare(status);
    expect(document.getElementById('short-url-rewarded-gpt')).not.toBeNull();
  });
  it('cancels queued callbacks', () => {
    const status = vi.fn();
    let queued: (() => void) | undefined;
    gpt.cmd.push.mockImplementation((callback) => {
      queued = callback;
    });
    const attempt = prepare(status);
    attempt.cancel();
    queued?.();
    expect(gpt.defineOutOfPageSlot).not.toHaveBeenCalled();
    expect(status).toHaveBeenLastCalledWith('cancelled');
  });
  it('prevents concurrent rewarded requests', () => {
    const first = vi.fn();
    const second = vi.fn();
    prepare(first);
    prepare(second);
    expect(second).toHaveBeenLastCalledWith('unavailable');
    expect(first).toHaveBeenLastCalledWith('loading');
    expect(gpt.defineOutOfPageSlot).toHaveBeenCalledOnce();
  });
  it('does not time out a ready or playing ad', () => {
    const status = vi.fn();
    const attempt = prepare(status);
    emit('rewardedSlotReady', { makeRewardedVisible: () => true });
    vi.advanceTimersByTime(60000);
    expect(status).toHaveBeenLastCalledWith('ready');
    attempt.show();
    vi.advanceTimersByTime(60000);
    expect(status).toHaveBeenLastCalledWith('showing');
  });
  it('handles a failed show without granting', () => {
    const status = vi.fn();
    const attempt = prepare(status);
    emit('rewardedSlotReady', { makeRewardedVisible: () => false });
    attempt.show();
    expect(status).toHaveBeenLastCalledWith('unavailable');
  });
});
