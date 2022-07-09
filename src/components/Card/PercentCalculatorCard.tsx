import React from 'react';
import {
  PercentCalculator,
  PercentageUpDown,
  PercentStoreState,
  ValueChange,
} from '@stores/PercentStore';

type PercentCalculatorCard = {
  calculator: PercentCalculator | PercentageUpDown;
  calculatorName: keyof PercentStoreState;
  valueChange: (props: ValueChange) => void;
  title: string;
  placeholder: string[];
  text: string[];
};

function PercentCalculatorCard({
  calculatorName,
  calculator,
  title,
  valueChange,
  placeholder,
  text,
}: PercentCalculatorCard) {
  return (
    <div className={'w-full flex flex-col space-y-4 rounded-xl bg-zinc-300 dark:bg-zinc-800 p-5'}>
      <div className={'flex'}>
        <h3 className={'text-sm md:text-base dark:text-white'}>{title}</h3>
      </div>
      <div className={'w-full flex flex-col md:flex-row justify-between space-y-1 md:space-y-0'}>
        <div className={'w-full md:w-3/4 flex items-center space-x-1'}>
          <input
            type={'text'}
            className={'w-1/4 h-[30px] md:h-[50px] rounded-xl md:rounded-2xl p-1 md:p-2 text-right'}
            placeholder={placeholder[0]}
            value={calculator.primaryNumber}
            onChange={(e) =>
              valueChange({
                target: calculatorName,
                targetValue: 'primaryNumber',
                value: e.target.value,
              })
            }
          />
          <span className={'text-xs md:text-base dark:text-white'}>{text[0]}</span>
          <input
            type={'text'}
            className={'w-1/4 h-[30px] md:h-[50px] rounded-xl md:rounded-2xl p-1 md:p-2 text-right'}
            placeholder={placeholder[1]}
            value={calculator.secondaryNumber}
            onChange={(e) =>
              valueChange({
                target: calculatorName,
                targetValue: 'secondaryNumber',
                value: e.target.value,
              })
            }
          />
          <span className={'text-xs md:text-base dark:text-white'}>{text[1]}</span>
          {'isIncrease' in calculator ? (
            <>
              <select
                className={
                  'w-1/6 h-[30px] md:h-[50px] rounded-xl md:rounded-2xl p-1 md:p-2 text-right'
                }
                value={calculator.isIncrease ? 'true' : 'false'}
                onChange={(e) =>
                  valueChange({
                    target: calculatorName,
                    targetValue: 'isIncrease',
                    value: e.target.value,
                  })
                }
              >
                <option value={'true'}>증가</option>
                <option value={'false'}>감소</option>
              </select>
              <span className={'text-xs md:text-base dark:text-white'}>{'하면?'}</span>
            </>
          ) : null}
        </div>
        <div className={'w-1/3 md:w-1/4 flex ml-auto md:ml-0 items-center space-x-1'}>
          <span className={'text-xs md:text-base dark:text-white'}>{text[2]}</span>
          <input
            type={'text'}
            className={
              'w-full h-[30px] md:h-[50px] rounded-xl md:rounded-2xl p-1 md:p-2 text-right'
            }
            placeholder={placeholder[2]}
            value={calculator.result.toLocaleString()}
            onChange={() => calculator.result}
          />
          <span className={'text-xs md:text-base dark:text-white'}>{text[3]}</span>
        </div>
      </div>
    </div>
  );
}

export default PercentCalculatorCard;