export type LiveType = 'twitch' | 'youtube' | 'chzzk' | 'soop' | 'kick';

export const platformMapper: Record<string, LiveType> = {
  t: 'twitch',
  y: 'youtube',
  c: 'chzzk',
  s: 'soop',
  k: 'kick',
};

export const getLiveUrl = (type: LiveType, id: string): string => {
  const urls: Record<LiveType, string> = {
    twitch: `https://player.twitch.tv/?channel=${id}`,
    youtube: `https://www.youtube.com/embed/${id}`,
    chzzk: `https://chzzk.naver.com/live/${id}`,
    soop: `https://play.sooplive.co.kr/${id}/embed`,
    kick: `https://player.kick.com/${id}`,
  };
  return urls[type];
};
