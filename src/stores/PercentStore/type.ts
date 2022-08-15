export interface PercentCalculator {
  primaryNumber: number | string;
  secondaryNumber: number | string;
  result: number | string;
}

export interface PercentageUpDown extends PercentCalculator {
  isIncrease: boolean;
}

export interface PercentCalculators {
  percentageOfTotal: PercentCalculator;
  partOfTotal: PercentCalculator;
  findPercentage: PercentCalculator;
  percentageUpDown: PercentageUpDown;
  findPercentageValue: PercentCalculator;
}

export interface ValueChange {
  target: keyof PercentCalculators;
  targetValue: keyof PercentCalculator | keyof PercentageUpDown;
  value: string;
}

export interface PercentStoreState {
  calculators: PercentCalculators;
  valueChange: (props: ValueChange) => void;
  handleResultCalculator: (target: keyof PercentCalculators) => void;
}
