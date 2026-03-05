'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DEFAULT_WASTE = 10;

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

type LumberBoardClientProps = {
  lng: Language;
};

export default function LumberBoardClient({ lng }: LumberBoardClientProps) {
  const { t } = useTranslation(lng, 'lumber-board');
  const [panelWidth, setPanelWidth] = useState('');
  const [panelLength, setPanelLength] = useState('');
  const [boardWidth, setBoardWidth] = useState('');
  const [boardLength, setBoardLength] = useState('');
  const [wastePercent, setWastePercent] = useState(String(DEFAULT_WASTE));

  const result = useMemo(() => {
    const panelW = toNumber(panelWidth);
    const panelL = toNumber(panelLength);
    const boardW = toNumber(boardWidth);
    const boardL = toNumber(boardLength);
    const waste = toNumber(wastePercent);

    const panelArea = panelW * panelL;
    const boardArea = boardW > 0 && boardL > 0 ? (boardW / 100) * (boardL / 100) : 0;
    const baseBoards = boardArea > 0 ? panelArea / boardArea : 0;
    const totalBoards = Math.ceil(baseBoards * (1 + waste / 100));

    return {
      panelArea,
      boardArea,
      totalBoards,
    };
  }, [panelWidth, panelLength, boardWidth, boardLength, wastePercent]);

  const reset = () => {
    setPanelWidth('');
    setPanelLength('');
    setBoardWidth('');
    setBoardLength('');
    setWastePercent(String(DEFAULT_WASTE));
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('panelWidthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('panelWidthPlaceholder')}
              value={panelWidth}
              onChange={(event) => setPanelWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('panelLengthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder={t('panelLengthPlaceholder')}
              value={panelLength}
              onChange={(event) => setPanelLength(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('boardWidthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder={t('boardWidthPlaceholder')}
              value={boardWidth}
              onChange={(event) => setBoardWidth(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('boardLengthLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              placeholder={t('boardLengthPlaceholder')}
              value={boardLength}
              onChange={(event) => setBoardLength(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('wasteLabel')}</span>
            <Input
              type="number"
              min={0}
              step="1"
              value={wastePercent}
              onChange={(event) => setWastePercent(event.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('panelAreaLabel')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('areaValue', { value: result.panelArea.toFixed(2) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('boardAreaLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('areaValue', { value: result.boardArea.toFixed(3) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('totalBoardsLabel')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('boardsValue', { value: result.totalBoards })}
          </p>
        </div>
      </section>
    </div>
  );
}
