import { observable, action, makeObservable, autorun } from 'mobx';
import {
  PercentCalculator,
  PercentCalculators,
  PercentStoreState,
  ValueChange,
} from '@stores/PercentStore/type';

const initialValue: PercentCalculator = {
  primaryNumber: '',
  secondaryNumber: '',
  result: '',
};

class PercentStore implements PercentStoreState {
  @observable public calculators: PercentCalculators = {
    percentageOfTotal: initialValue,
    partOfTotal: initialValue,
    findPercentage: initialValue,
    percentageUpDown: { ...initialValue, isIncrease: true },
    findPercentageValue: initialValue,
  };

  constructor() {
    makeObservable(this);
  }

  @action public valueChange = (props: ValueChange) => {
    const { calculators } = this;

    if (props.targetValue === 'isIncrease') {
      calculators.percentageUpDown.isIncrease = props.value === 'true';
    } else {
      if (isNaN(+props.value)) return;
      calculators[props.target][props.targetValue] = props.value;
    }

    autorun(() => this.handleResultCalculator(props.target));
  };

  @action public handleResultCalculator = (target: keyof PercentCalculators) => {
    const { calculators } = this;

    if (isNaN(+calculators[target].primaryNumber) || isNaN(+calculators[target].secondaryNumber))
      return;

    switch (target) {
      case 'percentageOfTotal':
        return (calculators[target].result =
          (+calculators[target].primaryNumber * +calculators[target].secondaryNumber) / 100);
      case 'partOfTotal':
        return (calculators[target].result =
          (+calculators[target].secondaryNumber * 100) / +calculators[target].primaryNumber);
      case 'findPercentage':
        return (calculators[target].result =
          ((+calculators[target].secondaryNumber - +calculators[target].primaryNumber) /
            +calculators[target].primaryNumber) *
          100);
      case 'percentageUpDown':
        return calculators.percentageUpDown.isIncrease
          ? (calculators[target].result =
              +calculators[target].primaryNumber +
              (+calculators[target].primaryNumber * +calculators[target].secondaryNumber) / 100)
          : (calculators[target].result =
              +calculators[target].primaryNumber -
              (+calculators[target].primaryNumber * +calculators[target].secondaryNumber) / 100);
      case 'findPercentageValue':
        return (calculators[target].result =
          (+calculators[target].secondaryNumber * 100) / +calculators[target].primaryNumber);
    }
  };
}

export default PercentStore;
