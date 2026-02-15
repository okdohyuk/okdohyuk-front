export type PasswordCheck = {
  key: string;
  passed: boolean;
};

type StrengthResult = {
  score: number;
  labelKey: string;
  checks: PasswordCheck[];
  warnings: string[];
};

const COMMON_PASSWORDS = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  '111111',
  'iloveyou',
];

const hasSequentialPattern = (value: string) => {
  const lowered = value.toLowerCase();
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789'];
  return sequences.some((sequence) =>
    Array.from(sequence).some((_, index) => {
      const slice = sequence.slice(index, index + 4);
      return slice.length === 4 && lowered.includes(slice);
    }),
  );
};

const hasRepeatedPattern = (value: string) => /(.)\1{2,}/.test(value);

export const analyzePasswordStrength = (value: string): StrengthResult => {
  const length8 = value.length >= 8;
  const length12 = value.length >= 12;
  const lower = /[a-z]/.test(value);
  const upper = /[A-Z]/.test(value);
  const number = /\d/.test(value);
  const symbol = /[^a-zA-Z\d\s]/.test(value);
  const common = COMMON_PASSWORDS.some((word) => value.toLowerCase().includes(word));
  const repeated = hasRepeatedPattern(value);
  const sequential = hasSequentialPattern(value);

  const checks: PasswordCheck[] = [
    { key: 'length8', passed: length8 },
    { key: 'length12', passed: length12 },
    { key: 'lower', passed: lower },
    { key: 'upper', passed: upper },
    { key: 'number', passed: number },
    { key: 'symbol', passed: symbol },
    { key: 'noCommon', passed: !common },
    { key: 'noRepeat', passed: !repeated && !sequential },
  ];

  let score = 0;
  if (length8) score += 1;
  if (length12) score += 1;
  if ([lower, upper, number, symbol].filter(Boolean).length >= 2) score += 1;
  if ([lower, upper, number, symbol].filter(Boolean).length >= 3) score += 1;
  if ([lower, upper, number, symbol].filter(Boolean).length === 4) score += 1;
  if (common) score -= 1;
  if (repeated || sequential) score -= 1;

  score = Math.max(0, Math.min(5, score));

  const labelKey = ['veryWeak', 'weak', 'okay', 'strong', 'veryStrong', 'veryStrong'][score];

  const warnings = [
    common ? 'warning.common' : '',
    repeated ? 'warning.repeat' : '',
    sequential ? 'warning.sequence' : '',
  ].filter(Boolean);

  return { score, labelKey, checks, warnings };
};
