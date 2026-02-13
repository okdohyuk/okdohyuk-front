export type TimeParts = {
  hours: string;
  minutes: string;
  seconds: string;
};

export const sanitizeNumberInput = (value: string, max?: number) => {
  if (!value) return '';
  const sanitized = value.replace(/\D/g, '');
  if (!sanitized) return '';
  const parsed = Number(sanitized);
  if (Number.isNaN(parsed)) return '';
  if (typeof max === 'number') {
    return String(Math.min(parsed, max));
  }
  return String(parsed);
};

export const toSeconds = (time: TimeParts) => {
  const hours = Number(time.hours || 0);
  const minutes = Number(time.minutes || 0);
  const seconds = Number(time.seconds || 0);

  const safeHours = Number.isNaN(hours) ? 0 : Math.max(hours, 0);
  const safeMinutes = Number.isNaN(minutes) ? 0 : Math.max(Math.min(minutes, 59), 0);
  const safeSeconds = Number.isNaN(seconds) ? 0 : Math.max(Math.min(seconds, 59), 0);

  return safeHours * 3600 + safeMinutes * 60 + safeSeconds;
};

export const formatTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(Math.round(totalSeconds), 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
};
