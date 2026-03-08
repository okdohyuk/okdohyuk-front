import {
  calculateSalaryValues,
  formatCurrencyInput,
  normalizeCurrencyInput,
  toNumber,
} from '../salaryConverter';

describe('salaryConverter', () => {
  it('converts monthly salary into hourly, daily, weekly, and annual values', () => {
    const result = calculateSalaryValues({
      mode: 'monthly',
      monthlySalary: '3200',
      hourlyWage: '',
      annualSalary: '',
      daysPerWeek: '5',
      hoursPerDay: '8',
      weeksPerMonth: '4',
    });

    expect(result.baseHourly).toBe(20);
    expect(result.daily).toBe(160);
    expect(result.weekly).toBe(800);
    expect(result.baseMonthly).toBe(3200);
    expect(result.annual).toBe(38400);
  });

  it('converts hourly wage into monthly and annual salary', () => {
    const result = calculateSalaryValues({
      mode: 'hourly',
      monthlySalary: '',
      hourlyWage: '25',
      annualSalary: '',
      daysPerWeek: '5',
      hoursPerDay: '8',
      weeksPerMonth: '4',
    });

    expect(result.baseHourly).toBe(25);
    expect(result.daily).toBe(200);
    expect(result.weekly).toBe(1000);
    expect(result.baseMonthly).toBe(4000);
    expect(result.annual).toBe(48000);
  });

  it('converts annual salary into monthly and hourly values', () => {
    const result = calculateSalaryValues({
      mode: 'annual',
      monthlySalary: '',
      hourlyWage: '',
      annualSalary: '60000',
      daysPerWeek: '5',
      hoursPerDay: '8',
      weeksPerMonth: '4',
    });

    expect(result.baseHourly).toBe(31.25);
    expect(result.daily).toBe(250);
    expect(result.weekly).toBe(1250);
    expect(result.baseMonthly).toBe(5000);
    expect(result.annual).toBe(60000);
  });

  it('returns zero hourly when work schedule is invalid', () => {
    const result = calculateSalaryValues({
      mode: 'annual',
      monthlySalary: '',
      hourlyWage: '',
      annualSalary: '60000',
      daysPerWeek: '0',
      hoursPerDay: '8',
      weeksPerMonth: '4',
    });

    expect(result.baseHourly).toBe(0);
    expect(result.daily).toBe(0);
    expect(result.weekly).toBe(0);
    expect(result.baseMonthly).toBe(5000);
    expect(result.annual).toBe(60000);
  });

  it('treats invalid numbers as zero', () => {
    expect(toNumber('invalid')).toBe(0);
  });

  it('normalizes currency inputs to digits only', () => {
    expect(normalizeCurrencyInput('12,34a5')).toBe('12345');
  });

  it('formats currency inputs with thousand separators', () => {
    expect(formatCurrencyInput('123456789')).toBe('123,456,789');
  });

  it('parses comma-formatted values safely', () => {
    expect(toNumber('123,456')).toBe(123456);
  });
});
