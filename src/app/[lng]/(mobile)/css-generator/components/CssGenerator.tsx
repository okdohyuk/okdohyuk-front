'use client';

import React, { useId, useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { CodeBlock } from './CodeBlock';
import { Control } from './Control';
import { GeneratorTabs } from './GeneratorTabs';
import { GradientDirectionSelect } from './GradientDirectionSelect';
import {
  buildGradientCss,
  buildGradientTailwind,
  buildShadowCss,
  buildShadowTailwind,
} from './generatorUtils';
import { GeneratorTab, GradientState, ShadowState } from './types';

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

export default function CssGenerator({ lng }: CssGeneratorProps) {
  const { t } = useTranslation(lng, 'css-generator');
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<GeneratorTab>('shadow');
  const [shadow, setShadow] = useState<ShadowState>(INITIAL_SHADOW);
  const [gradient, setGradient] = useState<GradientState>(INITIAL_GRADIENT);

  const shadowCss = useMemo(() => buildShadowCss(shadow), [shadow]);
  const shadowTailwind = useMemo(() => buildShadowTailwind(shadow), [shadow]);
  const gradientCss = useMemo(() => buildGradientCss(gradient), [gradient]);
  const gradientTailwind = useMemo(() => buildGradientTailwind(gradient), [gradient]);

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

  const updateShadow = <K extends keyof ShadowState>(key: K, value: ShadowState[K]) => {
    setShadow((prev) => ({ ...prev, [key]: value }));
  };

  const updateGradient = <K extends keyof GradientState>(key: K, value: GradientState[K]) => {
    setGradient((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextOpacity = Number.parseFloat(event.target.value);

    if (Number.isNaN(nextOpacity)) {
      return;
    }

    updateShadow('opacity', nextOpacity);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <GeneratorTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        shadowLabel={t('tab.shadow')}
        gradientLabel={t('tab.gradient')}
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
                    className="h-8 w-8 rounded cursor-pointer"
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
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div
                className="w-32 h-32 bg-white dark:bg-gray-700 rounded-lg"
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
                    className="h-8 w-8 rounded cursor-pointer"
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
                    className="h-8 w-8 rounded cursor-pointer"
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
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-48 h-48 rounded-lg" style={{ background: gradientCss }} />
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
    </div>
  );
}
