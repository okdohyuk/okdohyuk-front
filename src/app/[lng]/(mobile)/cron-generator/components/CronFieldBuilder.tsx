import React from 'react';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

export type CronFieldMode = 'any' | 'every' | 'at';

type CronFieldBuilderProps = {
  idPrefix: string;
  label: string;
  enabledLabel: string;
  modeLabel: string;
  valueLabel: string;
  anyLabel: string;
  everyLabel: string;
  atLabel: string;
  enabled: boolean;
  mode: CronFieldMode;
  value: number;
  min: number;
  max: number;
  onEnabledChange: (enabled: boolean) => void;
  onModeChange: (mode: CronFieldMode) => void;
  onValueChange: (value: number) => void;
};

function CronFieldBuilder({
  idPrefix,
  label,
  enabledLabel,
  modeLabel,
  valueLabel,
  anyLabel,
  everyLabel,
  atLabel,
  enabled,
  mode,
  value,
  min,
  max,
  onEnabledChange,
  onModeChange,
  onValueChange,
}: CronFieldBuilderProps) {
  return (
    <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-3')}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Text asChild variant="d3" className="block font-medium text-gray-700 dark:text-gray-300">
          <label htmlFor={`${idPrefix}-value`}>{label}</label>
        </Text>
        <label
          htmlFor={`${idPrefix}-enabled`}
          className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
        >
          <input
            id={`${idPrefix}-enabled`}
            type="checkbox"
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-point-1 focus:ring-point-1"
          />
          {enabledLabel}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-1">
          <Text asChild variant="c1" color="basic-5" className="block">
            <label htmlFor={`${idPrefix}-mode`}>{modeLabel}</label>
          </Text>
          <Select
            disabled={!enabled}
            value={mode}
            onValueChange={(nextMode) => onModeChange(nextMode as CronFieldMode)}
          >
            <SelectTrigger id={`${idPrefix}-mode`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{anyLabel}</SelectItem>
              <SelectItem value="every">{everyLabel}</SelectItem>
              <SelectItem value="at">{atLabel}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Text asChild variant="c1" color="basic-5" className="block">
            <label htmlFor={`${idPrefix}-value`}>
              {valueLabel} ({min}-{max})
            </label>
          </Text>
          <Input
            id={`${idPrefix}-value`}
            type="number"
            min={min}
            max={max}
            value={value}
            disabled={!enabled}
            onChange={(event) => {
              const parsed = Number.parseInt(event.target.value, 10);
              if (!Number.isNaN(parsed)) {
                if (mode === 'any') {
                  onModeChange('at');
                }
                onValueChange(parsed);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CronFieldBuilder;
