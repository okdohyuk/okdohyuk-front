const NUMBER_UNITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const SMALL_UNITS = ['', '십', '백', '천'];
const LARGE_UNITS = ['', '만', '억', '조', '경'];

const chunkNumber = (value: string, size = 4) => {
  const chunks: string[] = [];
  for (let index = value.length; index > 0; index -= size) {
    chunks.unshift(value.slice(Math.max(0, index - size), index));
  }
  return chunks;
};

const convertChunk = (chunk: string) => {
  const digits = chunk.padStart(4, '0').split('');
  return digits
    .map((digit, index) => {
      if (digit === '0') return '';
      const numberText = digit === '1' && index < 3 ? '' : NUMBER_UNITS[Number(digit)];
      return `${numberText}${SMALL_UNITS[3 - index]}`;
    })
    .join('');
};

export const convertKoreanAmount = (rawValue: string) => {
  if (!rawValue) return '';
  const normalized = rawValue.replace(/[^0-9]/g, '');
  if (!normalized) return '';
  if (normalized === '0') return '영';

  const chunks = chunkNumber(normalized);
  const converted = chunks
    .map((chunk, index) => {
      const chunkText = convertChunk(chunk);
      if (!chunkText) return '';
      const unitIndex = chunks.length - 1 - index;
      return `${chunkText}${LARGE_UNITS[unitIndex]}`;
    })
    .filter(Boolean)
    .join('');

  return converted || '';
};
