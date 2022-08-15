import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PercentCalculatorCard from '@components/Card/PercentCalculatorCard';
import PercentStore from '@stores/PercentStore';
import { Provider } from 'mobx-react';

describe('<PercentCalculatorCard />', () => {
  it('matches snapshot', () => {
    const percentStore = new PercentStore();
    const utils = render(
      <Provider percentStore={percentStore}>
        <PercentCalculatorCard
          title={'전체값의 몇 퍼센트는 얼마인가 계산'}
          placeholder={['10000', '20', '2,000']}
          calculatorName={'percentageOfTotal'}
          text={['의', '%', '=']}
        />
      </Provider>,
    );
    expect(utils.container).toMatchSnapshot();
  });
  it('calculation', () => {
    const percentStore = new PercentStore();
    render(
      <Provider percentStore={percentStore}>
        <PercentCalculatorCard
          title={'전체값의 몇 퍼센트는 얼마인가 계산'}
          placeholder={['10000', '20', '2,000']}
          calculatorName={'percentageOfTotal'}
          text={['의', '%', '=']}
        />
      </Provider>,
    );
    const inputOne = screen.getByPlaceholderText('10000');
    const inputTwo = screen.getByPlaceholderText('20');
    const result = screen.getByPlaceholderText('2,000');
    fireEvent.change(inputOne, { target: { value: '10000' } });
    fireEvent.change(inputTwo, { target: { value: '20' } });
    expect(inputOne.value).toBe('10000');
    expect(inputTwo.value).toBe('20');
    expect(result.value).toBe('2,000');
  });
});
