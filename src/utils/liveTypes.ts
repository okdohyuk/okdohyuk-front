export type LiveType = 'twitch' | 'youtube' | 'chzzk' | 'soop' | 'kick';

export const platformMapper: Record<string, LiveType> = {
  c: 'chzzk',
  s: 'soop',
  t: 'twitch',
  y: 'youtube',
  k: 'kick',
};

export const getLiveUrl = (type: LiveType, id: string): string => {
  const urls: Record<LiveType, string> = {
    chzzk: `https://chzzk.naver.com/live/${id}`,
    soop: `https://play.sooplive.co.kr/${id}/embed`,
    twitch: `https://player.twitch.tv/?channel=${id}`,
    youtube: `https://www.youtube.com/embed/${id}`,
    kick: `https://player.kick.com/${id}`,
  };
  return urls[type];
};
