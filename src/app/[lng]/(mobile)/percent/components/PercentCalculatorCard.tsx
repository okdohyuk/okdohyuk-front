'use client';

import React, { useMemo } from 'react';
import { PercentCalculators } from '@stores/PercentStore/type';
import useStore from '@hooks/useStore';
import { observer } from 'mobx-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

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
    <div className={cn(SERVICE_PANEL_SOFT, 'flex w-full flex-col space-y-4 p-4')}>
      <div className="flex">
        <h3 className="t-d-1 t-basic-1">{t(`${calculatorName}.title`)}</h3>
      </div>
      <div className="flex w-full flex-col justify-between space-y-1 md:flex-row md:space-y-0">
        <div className="flex w-full items-center space-x-1 md:w-3/4">
          <Input
            type="text"
            inputMode="numeric"
            className="w-1/4 text-right"
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
          <Input
            type="text"
            inputMode="numeric"
            className="w-1/4 text-right"
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
              <Select
                value={calculator.isIncrease ? 'true' : 'false'}
                onValueChange={(value) =>
                  valueChange({
                    target: calculatorName,
                    targetValue: 'isIncrease',
                    value,
                  })
                }
              >
                <SelectTrigger className="w-1/6">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t('increase')}</SelectItem>
                  <SelectItem value="false">{t('decrease')}</SelectItem>
                </SelectContent>
              </Select>
              <span className="t-d-2 t-basic-1">{t('to')}</span>
            </>
          ) : null}
        </div>
        <div className="ml-auto flex w-1/3 items-center space-x-1 md:ml-0 md:w-1/4">
          <span className="t-d-2 t-basic-1">{text[2]}</span>
          <Input
            type="text"
            inputMode="none"
            className="w-full text-right"
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
