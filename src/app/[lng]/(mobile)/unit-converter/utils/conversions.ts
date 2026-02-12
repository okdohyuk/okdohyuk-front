export type UnitCategory = 'length' | 'weight' | 'temperature';

export type UnitKey =
  | 'mm'
  | 'cm'
  | 'm'
  | 'km'
  | 'in'
  | 'ft'
  | 'yd'
  | 'mi'
  | 'g'
  | 'kg'
  | 'lb'
  | 'oz'
  | 'c'
  | 'f'
  | 'k';

export type UnitDefinition = {
  key: UnitKey;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

export type CategoryDefinition = {
  key: UnitCategory;
  defaultUnit: UnitKey;
  units: UnitDefinition[];
};

const lengthUnits: UnitDefinition[] = [
  {
    key: 'mm',
    symbol: 'mm',
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
  },
  {
    key: 'cm',
    symbol: 'cm',
    toBase: (value) => value / 100,
    fromBase: (value) => value * 100,
  },
  {
    key: 'm',
    symbol: 'm',
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  {
    key: 'km',
    symbol: 'km',
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
  },
  {
    key: 'in',
    symbol: 'in',
    toBase: (value) => value * 0.0254,
    fromBase: (value) => value / 0.0254,
  },
  {
    key: 'ft',
    symbol: 'ft',
    toBase: (value) => value * 0.3048,
    fromBase: (value) => value / 0.3048,
  },
  {
    key: 'yd',
    symbol: 'yd',
    toBase: (value) => value * 0.9144,
    fromBase: (value) => value / 0.9144,
  },
  {
    key: 'mi',
    symbol: 'mi',
    toBase: (value) => value * 1609.344,
    fromBase: (value) => value / 1609.344,
  },
];

const weightUnits: UnitDefinition[] = [
  {
    key: 'g',
    symbol: 'g',
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
  },
  {
    key: 'kg',
    symbol: 'kg',
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  {
    key: 'lb',
    symbol: 'lb',
    toBase: (value) => value * 0.45359237,
    fromBase: (value) => value / 0.45359237,
  },
  {
    key: 'oz',
    symbol: 'oz',
    toBase: (value) => value * 0.028349523125,
    fromBase: (value) => value / 0.028349523125,
  },
];

const temperatureUnits: UnitDefinition[] = [
  {
    key: 'c',
    symbol: '°C',
    toBase: (value) => value,
    fromBase: (value) => value,
  },
  {
    key: 'f',
    symbol: '°F',
    toBase: (value) => (value - 32) / 1.8,
    fromBase: (value) => value * 1.8 + 32,
  },
  {
    key: 'k',
    symbol: 'K',
    toBase: (value) => value - 273.15,
    fromBase: (value) => value + 273.15,
  },
];

export const UNIT_CATEGORIES: Record<UnitCategory, CategoryDefinition> = {
  length: {
    key: 'length',
    defaultUnit: 'm',
    units: lengthUnits,
  },
  weight: {
    key: 'weight',
    defaultUnit: 'kg',
    units: weightUnits,
  },
  temperature: {
    key: 'temperature',
    defaultUnit: 'c',
    units: temperatureUnits,
  },
};

export const formatValue = (value: number) =>
  value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  });
