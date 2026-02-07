export type DiffLine = {
  type: 'equal' | 'add' | 'remove';
  content: string;
  leftLine?: number;
  rightLine?: number;
};

export type DiffSummary = {
  added: number;
  removed: number;
  unchanged: number;
};

export type DiffResult = {
  lines: DiffLine[];
  summary: DiffSummary;
};

const normalizeLines = (value: string) => value.replace(/\r\n/g, '\n').split('\n');

export const createLineDiff = (leftText: string, rightText: string): DiffResult => {
  const leftLines = normalizeLines(leftText);
  const rightLines = normalizeLines(rightText);

  const m = leftLines.length;
  const n = rightLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      if (leftLines[i] === rightLines[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const lines: DiffLine[] = [];
  const summary: DiffSummary = { added: 0, removed: 0, unchanged: 0 };

  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (leftLines[i] === rightLines[j]) {
      lines.push({
        type: 'equal',
        content: leftLines[i],
        leftLine: i + 1,
        rightLine: j + 1,
      });
      summary.unchanged += 1;
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push({ type: 'remove', content: leftLines[i], leftLine: i + 1 });
      summary.removed += 1;
      i += 1;
    } else {
      lines.push({ type: 'add', content: rightLines[j], rightLine: j + 1 });
      summary.added += 1;
      j += 1;
    }
  }

  while (i < m) {
    lines.push({ type: 'remove', content: leftLines[i], leftLine: i + 1 });
    summary.removed += 1;
    i += 1;
  }

  while (j < n) {
    lines.push({ type: 'add', content: rightLines[j], rightLine: j + 1 });
    summary.added += 1;
    j += 1;
  }

  return { lines, summary };
};

const getLinePrefix = (type: DiffLine['type']) => {
  if (type === 'add') return '+';
  if (type === 'remove') return '-';
  return ' ';
};

export const buildUnifiedDiff = (lines: DiffLine[]) =>
  lines
    .map((line) => {
      const prefix = getLinePrefix(line.type);
      return `${prefix}${line.content}`;
    })
    .join('\n');

export const getLineStats = (value: string) => {
  const lines = normalizeLines(value);
  const nonEmpty = lines.filter((line) => line.trim().length > 0).length;
  return { total: lines.length, nonEmpty };
};
