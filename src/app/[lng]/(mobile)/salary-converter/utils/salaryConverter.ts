export const DEFAULT_WEEKS = 4.345;
export const DEFAULT_DAYS = 5;
export const DEFAULT_HOURS = 8;

export type SalaryMode = 'monthly' | 'hourly' | 'annual';

export type SalaryConverterInputs = {
  mode: SalaryMode;
  monthlySalary: string;
  hourlyWage: string;
  annualSalary: string;
  daysPerWeek: string;
  hoursPerDay: string;
  weeksPerMonth: string;
};

export type SalaryConverterValues = {
  baseHourly: number;
  daily: number;
  weekly: number;
  baseMonthly: number;
  annual: number;
};

export const normalizeCurrencyInput = (value: string) => {
  const digitsOnly = value.replace(/[^\d]/g, '');

  if (!digitsOnly) {
    return '';
  }

  return digitsOnly.replace(/^0+(?=\d)/, '');
};

export const formatCurrencyInput = (value: string) => {
  const normalized = normalizeCurrencyInput(value);

  if (!normalized) {
    return '';
  }

  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const toNumber = (value: string) => {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const calculateSalaryValues = ({
  mode,
  monthlySalary,
  hourlyWage,
  annualSalary,
  daysPerWeek,
  hoursPerDay,
  weeksPerMonth,
}: SalaryConverterInputs): SalaryConverterValues => {
  const days = toNumber(daysPerWeek);
  const hours = toNumber(hoursPerDay);
  const weeks = toNumber(weeksPerMonth);
  const monthly = toNumber(monthlySalary);
  const hourly = toNumber(hourlyWage);
  const annualSalaryValue = toNumber(annualSalary);

  const workHoursPerMonth = days * hours * weeks;

  let baseMonthly = 0;
  let baseHourly = 0;
  let annual = 0;

  if (mode === 'monthly') {
    baseMonthly = monthly;
    annual = monthly * 12;
    baseHourly = workHoursPerMonth > 0 ? baseMonthly / workHoursPerMonth : 0;
  }

  if (mode === 'hourly') {
    baseHourly = hourly;
    baseMonthly = workHoursPerMonth > 0 ? baseHourly * workHoursPerMonth : 0;
    annual = baseMonthly * 12;
  }

  if (mode === 'annual') {
    annual = annualSalaryValue;
    baseMonthly = annual / 12;
    baseHourly = workHoursPerMonth > 0 ? baseMonthly / workHoursPerMonth : 0;
  }

  return {
    baseHourly,
    daily: baseHourly * hours,
    weekly: baseHourly * hours * days,
    baseMonthly,
    annual,
  };
};
