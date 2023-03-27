import React, { useMemo } from 'react';
import { PercentCalculators } from '@stores/PercentStore/type';
import { toJS } from 'mobx';
import useStore from '@hooks/useStore';
import { observer } from 'mobx-react';
import { useTranslation } from 'next-i18next';
import PercentStore from '@stores/PercentStore';

type PercentCalculatorCard = {
  calculatorName: keyof PercentCalculators;
  title: string;
  placeholder: string[];
  text: string[];
};

function PercentCalculatorCard({
  calculatorName,
  title,
  placeholder,
  text,
}: PercentCalculatorCard) {
  const percentStore = useStore<PercentStore>('percentStore');
  const { valueChange } = percentStore;
  const { calculators } = toJS(percentStore);
  const { t } = useTranslation('percent');

  const calculator = useMemo(() => {
    return calculators[calculatorName];
  }, [calculatorName, calculators]);

  return (
    <div className={'w-full flex flex-col space-y-4 rounded-xl bg-zinc-300 dark:bg-zinc-800 p-5'}>
      <div className={'flex'}>
        <h3 className={'text-sm md:text-base dark:text-white'}>{title}</h3>
      </div>
      <div className={'w-full flex flex-col md:flex-row justify-between space-y-1 md:space-y-0'}>
        <div className={'w-full md:w-3/4 flex items-center space-x-1'}>
          <input
            type={'text'}
            inputMode={'numeric'}
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
            inputMode={'numeric'}
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
                <option value={'true'}>{t('increase')}</option>
                <option value={'false'}>{t('decrease')}</option>
              </select>
              <span className={'text-xs md:text-base dark:text-white'}>{t('to')}</span>
            </>
          ) : null}
        </div>
        <div className={'w-1/3 md:w-1/4 flex ml-auto md:ml-0 items-center space-x-1'}>
          <span className={'text-xs md:text-base dark:text-white'}>{text[2]}</span>
          <input
            type={'text'}
            inputMode={'none'}
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

export default observer(PercentCalculatorCard);
