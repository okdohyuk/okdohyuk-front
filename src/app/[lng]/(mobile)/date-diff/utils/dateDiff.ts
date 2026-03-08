const MS_PER_DAY = 24 * 60 * 60 * 1000;

type DateRangeResult = {
  totalDays: number;
  weeks: number;
  remainingDays: number;
  weekdays: number;
  weekends: number;
};

const parseDateInput = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
};

const calculateDateRange = (
  startValue: string,
  endValue: string,
  includeEnd: boolean,
): DateRangeResult | null => {
  const startDate = parseDateInput(startValue);
  const endDate = parseDateInput(endValue);

  if (!startDate || !endDate) return null;

  const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
  const totalDays = includeEnd ? diffDays + 1 : diffDays;

  if (totalDays < 0) return null;

  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  let weekdays = weeks * 5;
  let weekends = weeks * 2;
  const startDay = startDate.getUTCDay();

  for (let i = 0; i < remainingDays; i += 1) {
    const dayOfWeek = (startDay + i) % 7;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekends += 1;
    } else {
      weekdays += 1;
    }
  }

  return {
    totalDays,
    weeks,
    remainingDays,
    weekdays,
    weekends,
  };
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export { calculateDateRange, formatDateInput, parseDateInput };
export type { DateRangeResult };
