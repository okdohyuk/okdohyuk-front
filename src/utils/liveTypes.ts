export type LiveType = 'twitch' | 'youtube' | 'chzzk' | 'soop' | 'kick';

export const platformMapper: Record<string, LiveType> = {
  t: 'twitch',
  y: 'youtube',
  c: 'chzzk',
  s: 'soop',
  k: 'kick',
};
