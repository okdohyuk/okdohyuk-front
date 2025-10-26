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
      if (Number.isNaN(Number(props.value))) return;
      calculators[props.target][props.targetValue] = props.value;
    }

    autorun(() => this.handleResultCalculator(props.target));
  };

  @action public handleResultCalculator = (target: keyof PercentCalculators) => {
    const { calculators } = this;

    const calculator = calculators[target];

    const primary = Number(calculator.primaryNumber);
    const secondary = Number(calculator.secondaryNumber);

    if (Number.isNaN(primary) || Number.isNaN(secondary)) {
      calculator.result = '';
      return;
    }

    switch (target) {
      case 'percentageOfTotal':
        calculator.result = (primary * secondary) / 100;
        break;
      case 'partOfTotal':
        calculator.result = (secondary * 100) / primary;
        break;
      case 'findPercentage':
        calculator.result = ((secondary - primary) / primary) * 100;
        break;
      case 'percentageUpDown': {
        const { isIncrease } = calculators.percentageUpDown;
        calculators.percentageUpDown.result = isIncrease
          ? primary + (primary * secondary) / 100
          : primary - (primary * secondary) / 100;
        break;
      }
      case 'findPercentageValue':
        calculator.result = (secondary * 100) / primary;
        break;
      default:
        calculator.result = '';
        break;
    }
  };
}

export default PercentStore;
