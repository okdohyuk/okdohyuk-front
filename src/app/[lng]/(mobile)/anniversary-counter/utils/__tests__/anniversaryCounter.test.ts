import { addDays, calculateDDay, formatDateInput, parseDateInput } from '../anniversaryCounter';

describe('anniversaryCounter', () => {
  const baseDate = new Date(2026, 2, 8, 15, 30);

  it('parses a date input string as a local calendar date', () => {
    const parsed = parseDateInput('2026-03-08');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(2);
    expect(parsed?.getDate()).toBe(8);
  });

  it('returns null for an invalid date input string', () => {
    expect(parseDateInput('2026-02-29')).toBeNull();
    expect(parseDateInput('invalid-date')).toBeNull();
  });

  it('keeps today as D-Day even when includeToday is enabled', () => {
    const result = calculateDDay({
      targetDateInput: '2026-03-08',
      baseDate,
      includeToday: true,
    });

    expect(result).toEqual({
      diffDays: 0,
      statusDiffDays: 0,
      targetDate: new Date(2026, 2, 8),
    });
  });

  it('counts future dates without including today', () => {
    const result = calculateDDay({
      targetDateInput: '2026-03-09',
      baseDate,
      includeToday: false,
    });

    expect(result?.diffDays).toBe(1);
    expect(result?.statusDiffDays).toBe(1);
  });

  it('keeps D-Day labels based on the actual calendar gap', () => {
    const result = calculateDDay({
      targetDateInput: '2026-03-09',
      baseDate,
      includeToday: true,
    });

    expect(result?.diffDays).toBe(1);
  });

  it('counts status text with today included', () => {
    const result = calculateDDay({
      targetDateInput: '2026-03-09',
      baseDate,
      includeToday: true,
    });

    expect(result?.statusDiffDays).toBe(2);
  });

  it('counts past dates including today', () => {
    const result = calculateDDay({
      targetDateInput: '2026-03-07',
      baseDate,
      includeToday: true,
    });

    expect(result?.diffDays).toBe(-1);
    expect(result?.statusDiffDays).toBe(-2);
  });

  it('formats and offsets quick dates consistently', () => {
    const nextWeek = addDays(baseDate, 7);

    expect(formatDateInput(nextWeek)).toBe('2026-03-15');
  });
});
