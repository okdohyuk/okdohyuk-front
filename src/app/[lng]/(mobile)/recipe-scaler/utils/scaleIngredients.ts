const TOKEN_REGEX = /(\d+\s\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/g;

const parseToken = (token: string) => {
  if (token.includes(' ')) {
    const [whole, fraction] = token.split(' ');
    const [numerator, denominator] = fraction.split('/');
    return Number(whole) + Number(numerator) / Number(denominator);
  }

  if (token.includes('/')) {
    const [numerator, denominator] = token.split('/');
    return Number(numerator) / Number(denominator);
  }

  return Number(token);
};

const formatNumber = (value: number) => {
  if (Number.isNaN(value)) return '';
  if (Number.isInteger(value)) return value.toString();

  const fixed = value.toFixed(2);
  return fixed.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
};

export const scaleIngredientLine = (line: string, ratio: number) =>
  line.replace(TOKEN_REGEX, (token) => formatNumber(parseToken(token) * ratio));

export const scaleIngredientText = (text: string, ratio: number) =>
  text
    .split('\n')
    .map((line) => (line.trim() ? scaleIngredientLine(line, ratio) : line))
    .join('\n');
