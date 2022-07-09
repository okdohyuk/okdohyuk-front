import { observable, action, makeObservable } from 'mobx';
import React from 'react';

interface PercentCalculator {
  primaryNumber: number | string;
  secondaryNumber: number | string;
  result: number | string;
}

interface PercentageUpDown extends PercentCalculator {
  isIncrease: boolean;
}

interface PercentStoreState {
  percentageOfTotal: PercentCalculator;
  partOfTotal: PercentCalculator;
  findPercentage: PercentCalculator;
  percentageUpDown: PercentageUpDown;
  findPercentageValue: PercentCalculator;
  valueChange: (props: ValueChange) => void;
}

type ValueChange = {
  target: keyof PercentStoreState;
  targetValue: keyof PercentCalculator;
  value: React.ChangeEvent<HTMLInputElement>;
};

const initialValue: PercentCalculator = {
  primaryNumber: '',
  secondaryNumber: '',
  result: '',
};

class PercentStore implements PercentStoreState {
  @observable public percentageOfTotal: PercentCalculator = initialValue;
  @observable public partOfTotal: PercentCalculator = initialValue;
  @observable public findPercentage: PercentCalculator = initialValue;
  @observable public percentageUpDown: PercentageUpDown = { ...initialValue, isIncrease: true };
  @observable public findPercentageValue: PercentCalculator = initialValue;

  constructor() {
    makeObservable(this);
  }

  @action public valueChange = (props: ValueChange) => {
    if (props.target === 'valueChange') return;
    if (isNaN(+props.value.target.value)) return;
    this[props.target][props.targetValue] = +props.value.target.value;

    if (isNaN(+this[props.target].primaryNumber) || isNaN(+this[props.target].secondaryNumber))
      return;

    this[props.target].result =
      (+this[props.target].primaryNumber * +this[props.target].secondaryNumber) / 100;
  };
}

export default PercentStore;
