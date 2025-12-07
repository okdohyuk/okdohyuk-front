'use client';

import React, { useMemo } from 'react';
import { PercentCalculators } from '@stores/PercentStore/type';
import useStore from '@hooks/useStore';
import { observer } from 'mobx-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type PercentCalculatorCardProps = {
  calculatorName: keyof PercentCalculators;
  placeholder: string[];
  text: string[];
  lng: Language;
};

function PercentCalculatorCard({
  calculatorName,
  placeholder,
  text,
  lng,
}: PercentCalculatorCardProps) {
  const { valueChange, calculators } = useStore('percentStore');
  const { t } = useTranslation(lng, 'percent');

  const calculator = useMemo(() => {
    return calculators[calculatorName];
  }, [calculatorName, calculators]);

  return (
    <div className="w-full flex flex-col space-y-4 rounded-md bg-basic-4 p-4">
      <div className="flex">
        <h3 className="t-d-1 t-basic-1">{t(`${calculatorName}.title`)}</h3>
      </div>
      <div className="w-full flex flex-col md:flex-row justify-between space-y-1 md:space-y-0">
        <div className="w-full md:w-3/4 flex items-center space-x-1">
          <input
            type="text"
            inputMode="numeric"
            className="input-text w-1/4 text-right"
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
          <span className="t-d-2 t-basic-1">{text[0]}</span>
          <input
            type="text"
            inputMode="numeric"
            className="input-text w-1/4 text-right"
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
          <span className="t-d-2 t-basic-1">{text[1]}</span>
          {'isIncrease' in calculator ? (
            <>
              <select
                className="input-text w-1/6 text-right"
                value={calculator.isIncrease ? 'true' : 'false'}
                onChange={(e) =>
                  valueChange({
                    target: calculatorName,
                    targetValue: 'isIncrease',
                    value: e.target.value,
                  })
                }
              >
                <option value="true">{t('increase')}</option>
                <option value="false">{t('decrease')}</option>
              </select>
              <span className="t-d-2 t-basic-1">{t('to')}</span>
            </>
          ) : null}
        </div>
        <div className="w-1/3 md:w-1/4 flex ml-auto md:ml-0 items-center space-x-1">
          <span className="t-d-2 t-basic-1">{text[2]}</span>
          <input
            type="text"
            inputMode="none"
            className="input-text w-full text-right"
            placeholder={placeholder[2]}
            value={calculator.result.toLocaleString()}
            onChange={() => calculator.result}
          />
          <span className="t-d-2 t-basic-1">{text[3]}</span>
        </div>
      </div>
    </div>
  );
}

export default observer(PercentCalculatorCard);
