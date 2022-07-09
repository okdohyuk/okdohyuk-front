import { observable, action, makeObservable } from 'mobx';

export interface PercentCalculator {
  primaryNumber: number | string;
  secondaryNumber: number | string;
  result: number | string;
}

export interface PercentageUpDown extends PercentCalculator {
  isIncrease: boolean;
}

export interface PercentStoreState {
  percentageOfTotal: PercentCalculator;
  partOfTotal: PercentCalculator;
  findPercentage: PercentCalculator;
  percentageUpDown: PercentageUpDown;
  findPercentageValue: PercentCalculator;
  valueChange: (props: ValueChange) => void;
}

export interface ValueChange {
  target: keyof PercentStoreState;
  targetValue: keyof PercentCalculator | keyof PercentageUpDown;
  value: string;
}

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

    if (props.targetValue === 'isIncrease') {
      this.percentageUpDown.isIncrease = props.value === 'true';
    } else {
      if (isNaN(+props.value)) return;
      this[props.target][props.targetValue] = +props.value;
    }

    if (isNaN(+this[props.target].primaryNumber) || isNaN(+this[props.target].secondaryNumber))
      return;

    switch (props.target) {
      case 'percentageOfTotal':
        return (this[props.target].result =
          (+this[props.target].primaryNumber * +this[props.target].secondaryNumber) / 100);
      case 'partOfTotal':
        return (this[props.target].result =
          (+this[props.target].secondaryNumber * 100) / +this[props.target].primaryNumber);
      case 'findPercentage':
        return (this[props.target].result =
          ((+this[props.target].secondaryNumber - +this[props.target].primaryNumber) /
            +this[props.target].primaryNumber) *
          100);
      case 'percentageUpDown':
        return this.percentageUpDown.isIncrease
          ? (this[props.target].result =
              +this[props.target].primaryNumber +
              (+this[props.target].primaryNumber * +this[props.target].secondaryNumber) / 100)
          : (this[props.target].result =
              +this[props.target].primaryNumber -
              (+this[props.target].primaryNumber * +this[props.target].secondaryNumber) / 100);
      case 'findPercentageValue':
        return (this[props.target].result =
          (+this[props.target].secondaryNumber * 100) / +this[props.target].primaryNumber);
    }
  };
}

export default PercentStore;
