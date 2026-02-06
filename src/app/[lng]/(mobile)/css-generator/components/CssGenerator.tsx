'use client';

import React, { useId, useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { CodeBlock } from './CodeBlock';
import { Control } from './Control';
import { GeneratorTabs } from './GeneratorTabs';
import { GradientDirectionSelect } from './GradientDirectionSelect';
import {
  buildFlexCss,
  buildFlexTailwind,
  buildGradientCss,
  buildGradientTailwind,
  buildGridCss,
  buildGridTailwind,
  buildRadiusCss,
  buildRadiusTailwind,
  buildShadowCss,
  buildShadowTailwind,
} from './generatorUtils';
import {
  FlexState,
  GeneratorTab,
  GradientState,
  GridState,
  RadiusState,
  ShadowState,
} from './types';

interface CssGeneratorProps {
  lng: Language;
}

const INITIAL_SHADOW: ShadowState = {
  x: 0,
  y: 4,
  blur: 6,
  spread: -1,
  color: '#000000',
  opacity: 0.1,
};

const INITIAL_GRADIENT: GradientState = {
  direction: 'to right',
  from: '#3b82f6',
  to: '#ef4444',
};

const INITIAL_RADIUS: RadiusState = {
  topLeft: 16,
  topRight: 16,
  bottomRight: 16,
  bottomLeft: 16,
};

const INITIAL_FLEX: FlexState = {
  direction: 'row',
  wrap: 'nowrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
};

const INITIAL_GRID: GridState = {
  columns: 3,
  rows: 2,
  justifyItems: 'center',
  alignItems: 'center',
  gap: 12,
};

const FLEX_PREVIEW_ITEMS = [1, 2, 3, 4, 5];

export default function CssGenerator({ lng }: CssGeneratorProps) {
  const { t } = useTranslation(lng, 'css-generator');
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<GeneratorTab>('shadow');
  const [shadow, setShadow] = useState<ShadowState>(INITIAL_SHADOW);
  const [gradient, setGradient] = useState<GradientState>(INITIAL_GRADIENT);
  const [radius, setRadius] = useState<RadiusState>(INITIAL_RADIUS);
  const [flex, setFlex] = useState<FlexState>(INITIAL_FLEX);
  const [grid, setGrid] = useState<GridState>(INITIAL_GRID);

  const shadowCss = useMemo(() => buildShadowCss(shadow), [shadow]);
  const shadowTailwind = useMemo(() => buildShadowTailwind(shadow), [shadow]);
  const gradientCss = useMemo(() => buildGradientCss(gradient), [gradient]);
  const gradientTailwind = useMemo(() => buildGradientTailwind(gradient), [gradient]);
  const radiusCss = useMemo(() => buildRadiusCss(radius), [radius]);
  const radiusTailwind = useMemo(() => buildRadiusTailwind(radius), [radius]);
  const flexCss = useMemo(() => buildFlexCss(flex), [flex]);
  const flexTailwind = useMemo(() => buildFlexTailwind(flex), [flex]);
  const gridCss = useMemo(() => buildGridCss(grid), [grid]);
  const gridTailwind = useMemo(() => buildGridTailwind(grid), [grid]);

  const gridPreviewItemCount = useMemo(
    () => Math.max(1, Math.min(24, grid.columns * grid.rows)),
    [grid.columns, grid.rows],
  );

  const gradientDirectionOptions = useMemo(
    () => [
      { value: 'to right', label: t('gradient.toRight') },
      { value: 'to left', label: t('gradient.toLeft') },
      { value: 'to bottom', label: t('gradient.toBottom') },
      { value: 'to top', label: t('gradient.toTop') },
      { value: 'to bottom right', label: t('gradient.toBottomRight') },
      { value: 'to top right', label: t('gradient.toTopRight') },
    ],
    [t],
  );

  const flexDirectionOptions = useMemo(
    () => [
      { value: 'row', label: t('flex.row') },
      { value: 'row-reverse', label: t('flex.rowReverse') },
      { value: 'column', label: t('flex.column') },
      { value: 'column-reverse', label: t('flex.columnReverse') },
    ],
    [t],
  );

  const flexWrapOptions = useMemo(
    () => [
      { value: 'nowrap', label: t('flex.noWrap') },
      { value: 'wrap', label: t('flex.wrap') },
    ],
    [t],
  );

  const flexJustifyOptions = useMemo(
    () => [
      { value: 'flex-start', label: t('flex.justifyStart') },
      { value: 'center', label: t('flex.justifyCenter') },
      { value: 'flex-end', label: t('flex.justifyEnd') },
      { value: 'space-between', label: t('flex.justifyBetween') },
      { value: 'space-around', label: t('flex.justifyAround') },
      { value: 'space-evenly', label: t('flex.justifyEvenly') },
    ],
    [t],
  );

  const flexAlignOptions = useMemo(
    () => [
      { value: 'stretch', label: t('flex.alignStretch') },
      { value: 'flex-start', label: t('flex.alignStart') },
      { value: 'center', label: t('flex.alignCenter') },
      { value: 'flex-end', label: t('flex.alignEnd') },
      { value: 'baseline', label: t('flex.alignBaseline') },
    ],
    [t],
  );

  const gridAlignOptions = useMemo(
    () => [
      { value: 'stretch', label: t('grid.stretch') },
      { value: 'start', label: t('grid.start') },
      { value: 'center', label: t('grid.center') },
      { value: 'end', label: t('grid.end') },
    ],
    [t],
  );

  const updateShadow = <K extends keyof ShadowState>(key: K, value: ShadowState[K]) => {
    setShadow((prev) => ({ ...prev, [key]: value }));
  };

  const updateGradient = <K extends keyof GradientState>(key: K, value: GradientState[K]) => {
    setGradient((prev) => ({ ...prev, [key]: value }));
  };

  const updateRadius = <K extends keyof RadiusState>(key: K, value: RadiusState[K]) => {
    setRadius((prev) => ({ ...prev, [key]: value }));
  };

  const updateFlex = <K extends keyof FlexState>(key: K, value: FlexState[K]) => {
    setFlex((prev) => ({ ...prev, [key]: value }));
  };

  const updateGrid = <K extends keyof GridState>(key: K, value: GridState[K]) => {
    setGrid((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextOpacity = Number.parseFloat(event.target.value);

    if (Number.isNaN(nextOpacity)) {
      return;
    }

    updateShadow('opacity', nextOpacity);
  };

  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'w-full space-y-8 p-4')}>
      <GeneratorTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        shadowLabel={t('tab.shadow')}
        gradientLabel={t('tab.gradient')}
        radiusLabel={t('tab.radius')}
        flexLabel={t('tab.flex')}
        gridLabel={t('tab.grid')}
      />

      {activeTab === 'shadow' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <Control
                id={`${baseId}-shadow-x`}
                label={t('shadow.offsetX')}
                value={shadow.x}
                min={-100}
                max={100}
                onChange={(value) => updateShadow('x', value)}
              />
              <Control
                id={`${baseId}-shadow-y`}
                label={t('shadow.offsetY')}
                value={shadow.y}
                min={-100}
                max={100}
                onChange={(value) => updateShadow('y', value)}
              />
              <Control
                id={`${baseId}-shadow-blur`}
                label={t('shadow.blur')}
                value={shadow.blur}
                min={0}
                max={100}
                onChange={(value) => updateShadow('blur', value)}
              />
              <Control
                id={`${baseId}-shadow-spread`}
                label={t('shadow.spread')}
                value={shadow.spread}
                min={-100}
                max={100}
                onChange={(value) => updateShadow('spread', value)}
              />
              <div className="space-y-1">
                <Text asChild variant="c1" color="basic-5" className="block font-medium">
                  <label htmlFor={`${baseId}-shadow-color`}>{t('shadow.color')}</label>
                </Text>
                <div className="flex items-center gap-2">
                  <input
                    id={`${baseId}-shadow-color`}
                    type="color"
                    title={t('shadow.color')}
                    value={shadow.color}
                    onChange={(event) => updateShadow('color', event.target.value)}
                    className="h-8 w-8 cursor-pointer rounded"
                  />
                  <Input
                    type="number"
                    value={shadow.opacity}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={handleOpacityChange}
                    className="w-20"
                    aria-label={t('shadow.opacity')}
                  />
                  <Text variant="d3" color="basic-5">
                    {t('shadow.opacity')}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <div
                className="h-32 w-32 rounded-lg bg-white dark:bg-gray-700"
                style={{ boxShadow: shadowCss }}
              />
            </div>
            <CodeBlock
              id={`${baseId}-code-css`}
              title={t('code.css')}
              code={`box-shadow: ${shadowCss};`}
              tooltip={t('code.copy')}
            />
            <CodeBlock
              id={`${baseId}-code-tailwind`}
              title={t('code.tailwind')}
              code={shadowTailwind}
              tooltip={t('code.copy')}
            />
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <GradientDirectionSelect
                id={`${baseId}-gradient-direction`}
                label={t('gradient.direction')}
                value={gradient.direction}
                options={gradientDirectionOptions}
                onChange={(value) => updateGradient('direction', value)}
              />
              <div className="space-y-1">
                <Text asChild variant="c1" color="basic-5" className="block font-medium">
                  <label htmlFor={`${baseId}-gradient-from`}>{t('gradient.from')}</label>
                </Text>
                <div className="flex items-center gap-2">
                  <input
                    id={`${baseId}-gradient-from`}
                    type="color"
                    title={t('gradient.from')}
                    value={gradient.from}
                    onChange={(event) => updateGradient('from', event.target.value)}
                    className="h-8 w-8 cursor-pointer rounded"
                  />
                  <Input
                    value={gradient.from}
                    onChange={(event) => updateGradient('from', event.target.value)}
                    aria-label={t('gradient.from')}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Text asChild variant="c1" color="basic-5" className="block font-medium">
                  <label htmlFor={`${baseId}-gradient-to`}>{t('gradient.to')}</label>
                </Text>
                <div className="flex items-center gap-2">
                  <input
                    id={`${baseId}-gradient-to`}
                    type="color"
                    title={t('gradient.to')}
                    value={gradient.to}
                    onChange={(event) => updateGradient('to', event.target.value)}
                    className="h-8 w-8 cursor-pointer rounded"
                  />
                  <Input
                    value={gradient.to}
                    onChange={(event) => updateGradient('to', event.target.value)}
                    aria-label={t('gradient.to')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <div className="h-48 w-48 rounded-lg" style={{ background: gradientCss }} />
            </div>
            <CodeBlock
              id={`${baseId}-code-grad-css`}
              title={t('code.css')}
              code={`background: ${gradientCss};`}
              tooltip={t('code.copy')}
            />
            <CodeBlock
              id={`${baseId}-code-grad-tw`}
              title={`${t('code.tailwind')} (Arbitrary)`}
              code={gradientTailwind}
              tooltip={t('code.copy')}
            />
          </div>
        </div>
      )}

      {activeTab === 'radius' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <Control
                id={`${baseId}-radius-top-left`}
                label={t('radius.topLeft')}
                value={radius.topLeft}
                min={0}
                max={200}
                onChange={(value) => updateRadius('topLeft', value)}
              />
              <Control
                id={`${baseId}-radius-top-right`}
                label={t('radius.topRight')}
                value={radius.topRight}
                min={0}
                max={200}
                onChange={(value) => updateRadius('topRight', value)}
              />
              <Control
                id={`${baseId}-radius-bottom-right`}
                label={t('radius.bottomRight')}
                value={radius.bottomRight}
                min={0}
                max={200}
                onChange={(value) => updateRadius('bottomRight', value)}
              />
              <Control
                id={`${baseId}-radius-bottom-left`}
                label={t('radius.bottomLeft')}
                value={radius.bottomLeft}
                min={0}
                max={200}
                onChange={(value) => updateRadius('bottomLeft', value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <div
                className="h-40 w-40 border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"
                style={{ borderRadius: radiusCss }}
              />
            </div>
            <CodeBlock
              id={`${baseId}-code-radius-css`}
              title={t('code.css')}
              code={`border-radius: ${radiusCss};`}
              tooltip={t('code.copy')}
            />
            <CodeBlock
              id={`${baseId}-code-radius-tailwind`}
              title={`${t('code.tailwind')} (Arbitrary)`}
              code={radiusTailwind}
              tooltip={t('code.copy')}
            />
          </div>
        </div>
      )}

      {activeTab === 'flex' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <GradientDirectionSelect
                id={`${baseId}-flex-direction`}
                label={t('flex.direction')}
                value={flex.direction}
                options={flexDirectionOptions}
                onChange={(value) => updateFlex('direction', value as FlexState['direction'])}
              />
              <GradientDirectionSelect
                id={`${baseId}-flex-wrap`}
                label={t('flex.wrapMode')}
                value={flex.wrap}
                options={flexWrapOptions}
                onChange={(value) => updateFlex('wrap', value as FlexState['wrap'])}
              />
              <GradientDirectionSelect
                id={`${baseId}-flex-justify`}
                label={t('flex.justifyContent')}
                value={flex.justifyContent}
                options={flexJustifyOptions}
                onChange={(value) =>
                  updateFlex('justifyContent', value as FlexState['justifyContent'])
                }
              />
              <GradientDirectionSelect
                id={`${baseId}-flex-align`}
                label={t('flex.alignItems')}
                value={flex.alignItems}
                options={flexAlignOptions}
                onChange={(value) => updateFlex('alignItems', value as FlexState['alignItems'])}
              />
              <Control
                id={`${baseId}-flex-gap`}
                label={t('flex.gap')}
                value={flex.gap}
                min={0}
                max={48}
                onChange={(value) => updateFlex('gap', value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div
                className="h-56 rounded-lg border border-dashed border-gray-300 bg-white/80 p-2 dark:border-gray-600 dark:bg-gray-700/70"
                style={{
                  display: 'flex',
                  flexDirection: flex.direction,
                  flexWrap: flex.wrap,
                  justifyContent: flex.justifyContent,
                  alignItems: flex.alignItems,
                  gap: `${flex.gap}px`,
                }}
              >
                {FLEX_PREVIEW_ITEMS.map((item) => (
                  <div
                    key={item}
                    className="flex min-w-10 items-center justify-center rounded-md border border-point-1/40 bg-point-1/10 px-3 py-2 text-xs font-semibold text-point-1"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <CodeBlock
              id={`${baseId}-code-flex-css`}
              title={t('code.css')}
              code={flexCss}
              tooltip={t('code.copy')}
            />
            <CodeBlock
              id={`${baseId}-code-flex-tailwind`}
              title={`${t('code.tailwind')} (Arbitrary)`}
              code={flexTailwind}
              tooltip={t('code.copy')}
            />
          </div>
        </div>
      )}

      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <Control
                id={`${baseId}-grid-columns`}
                label={t('grid.columns')}
                value={grid.columns}
                min={1}
                max={6}
                onChange={(value) => updateGrid('columns', value)}
              />
              <Control
                id={`${baseId}-grid-rows`}
                label={t('grid.rows')}
                value={grid.rows}
                min={1}
                max={6}
                onChange={(value) => updateGrid('rows', value)}
              />
              <GradientDirectionSelect
                id={`${baseId}-grid-justify-items`}
                label={t('grid.justifyItems')}
                value={grid.justifyItems}
                options={gridAlignOptions}
                onChange={(value) => updateGrid('justifyItems', value as GridState['justifyItems'])}
              />
              <GradientDirectionSelect
                id={`${baseId}-grid-align-items`}
                label={t('grid.alignItems')}
                value={grid.alignItems}
                options={gridAlignOptions}
                onChange={(value) => updateGrid('alignItems', value as GridState['alignItems'])}
              />
              <Control
                id={`${baseId}-grid-gap`}
                label={t('grid.gap')}
                value={grid.gap}
                min={0}
                max={48}
                onChange={(value) => updateGrid('gap', value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div
                className="h-56 rounded-lg border border-dashed border-gray-300 bg-white/80 p-2 dark:border-gray-600 dark:bg-gray-700/70"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))`,
                  justifyItems: grid.justifyItems,
                  alignItems: grid.alignItems,
                  gap: `${grid.gap}px`,
                }}
              >
                {Array.from({ length: gridPreviewItemCount }, (_, index) => index + 1).map(
                  (item) => (
                    <div
                      key={item}
                      className="flex rounded-md border border-point-1/40 bg-point-1/10 text-xs font-semibold text-point-1"
                      style={{
                        width: grid.justifyItems === 'stretch' ? '100%' : '2.5rem',
                        height: grid.alignItems === 'stretch' ? '100%' : '2.5rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>
            <CodeBlock
              id={`${baseId}-code-grid-css`}
              title={t('code.css')}
              code={gridCss}
              tooltip={t('code.copy')}
            />
            <CodeBlock
              id={`${baseId}-code-grid-tailwind`}
              title={`${t('code.tailwind')} (Arbitrary)`}
              code={gridTailwind}
              tooltip={t('code.copy')}
            />
          </div>
        </div>
      )}
    </div>
  );
}
