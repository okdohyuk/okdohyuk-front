const MS_PER_DAY = 1000 * 60 * 60 * 24;

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const getCalendarDayNumber = (date: Date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);

export const parseDateInput = (value: string): Date | null => {
  if (!DATE_INPUT_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

type CalculateDDayOptions = {
  targetDateInput: string;
  baseDate?: Date;
  includeToday?: boolean;
};

type DDayCalculation = {
  diffDays: number;
  statusDiffDays: number;
  targetDate: Date;
};

export const calculateDDay = ({
  targetDateInput,
  baseDate = new Date(),
  includeToday = true,
}: CalculateDDayOptions): DDayCalculation | null => {
  const targetDate = parseDateInput(targetDateInput);

  if (!targetDate) {
    return null;
  }

  const diffDays = getCalendarDayNumber(targetDate) - getCalendarDayNumber(baseDate);
  let statusDiffDays = diffDays;

  if (includeToday && statusDiffDays !== 0) {
    statusDiffDays += statusDiffDays > 0 ? 1 : -1;
  }

  return {
    diffDays,
    statusDiffDays,
    targetDate,
  };
};

export type { DDayCalculation, CalculateDDayOptions };
