import { Language } from '~/app/i18n/settings';

export const getLocaleTag = (lng: Language) => {
  switch (lng) {
    case 'en':
      return 'en-US';
    case 'ja':
      return 'ja-JP';
    case 'zh':
      return 'zh-CN';
    default:
      return 'ko-KR';
  }
};

export const padTime = (value: number) => `${value}`.padStart(2, '0');

export const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = padTime(date.getMonth() + 1);
  const day = padTime(date.getDate());
  return `${year}-${month}-${day}`;
};

export const formatTimeInput = (date: Date) => {
  const hours = padTime(date.getHours());
  const minutes = padTime(date.getMinutes());
  return `${hours}:${minutes}`;
};

export const createDateTimeFromInputs = (date: string, time: string) => {
  if (!date || !time) return null;
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  const candidate = new Date(`${date}T${normalizedTime}`);
  if (Number.isNaN(candidate.getTime())) return null;
  return candidate;
};

export const formatDateOutput = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

export const formatTimeOutput = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

export const formatWeekday = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
