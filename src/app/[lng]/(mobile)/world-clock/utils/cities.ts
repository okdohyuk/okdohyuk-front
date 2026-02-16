export type WorldCity = {
  id: string;
  timeZone: string;
};

export const WORLD_CITIES: WorldCity[] = [
  { id: 'seoul', timeZone: 'Asia/Seoul' },
  { id: 'tokyo', timeZone: 'Asia/Tokyo' },
  { id: 'beijing', timeZone: 'Asia/Shanghai' },
  { id: 'singapore', timeZone: 'Asia/Singapore' },
  { id: 'sydney', timeZone: 'Australia/Sydney' },
  { id: 'losAngeles', timeZone: 'America/Los_Angeles' },
  { id: 'newYork', timeZone: 'America/New_York' },
  { id: 'london', timeZone: 'Europe/London' },
  { id: 'paris', timeZone: 'Europe/Paris' },
  { id: 'berlin', timeZone: 'Europe/Berlin' },
  { id: 'dubai', timeZone: 'Asia/Dubai' },
  { id: 'saoPaulo', timeZone: 'America/Sao_Paulo' },
];

export const DEFAULT_CITY_IDS = ['seoul', 'tokyo', 'london'];
