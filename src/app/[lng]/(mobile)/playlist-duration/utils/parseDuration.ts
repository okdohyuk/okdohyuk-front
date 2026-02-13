type ParseResult = {
  seconds: number;
  normalized: string;
};

const toNumber = (value: string) => Number(value.replace(/[^0-9]/g, ''));

const formatTime = (hours: number, minutes: number, seconds: number) => {
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const parseWithColon = (value: string): ParseResult | null => {
  const parts = value.split(':').map((part) => part.trim());
  if (parts.length === 2) {
    const minutes = toNumber(parts[0]);
    const seconds = toNumber(parts[1]);
    if (Number.isNaN(minutes) || Number.isNaN(seconds) || seconds > 59) {
      return null;
    }
    const totalSeconds = minutes * 60 + seconds;
    return { seconds: totalSeconds, normalized: formatTime(0, minutes, seconds) };
  }

  if (parts.length === 3) {
    const hours = toNumber(parts[0]);
    const minutes = toNumber(parts[1]);
    const seconds = toNumber(parts[2]);
    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      minutes > 59 ||
      seconds > 59
    ) {
      return null;
    }
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return { seconds: totalSeconds, normalized: formatTime(hours, minutes, seconds) };
  }

  return null;
};

const parseWithoutColon = (value: string): ParseResult | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.toLowerCase().endsWith('s')) {
    const secondsValue = toNumber(trimmed.slice(0, -1));
    if (Number.isNaN(secondsValue)) return null;
    return { seconds: secondsValue, normalized: formatTime(0, 0, secondsValue) };
  }

  const minutesValue = toNumber(trimmed.replace(/[mM]/g, ''));
  if (Number.isNaN(minutesValue)) return null;
  return { seconds: minutesValue * 60, normalized: formatTime(0, minutesValue, 0) };
};

export const parseDurationLine = (value: string): ParseResult | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes(':')) {
    return parseWithColon(trimmed);
  }
  return parseWithoutColon(trimmed);
};
