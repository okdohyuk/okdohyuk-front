'use client';

import React, { useState, useId } from 'react';
import { Input } from '@components/basic/Input';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

interface CssGeneratorProps {
  lng: Language;
}

function Control({
  label,
  value,
  min,
  max,
  onChange,
  id,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  id: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label htmlFor={id} className="text-xs font-medium text-gray-500">
          {label}
        </label>
        <span className="text-xs text-gray-900 dark:text-gray-100">{value}px</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
    </div>
  );
}

function CodeBlock({
  title,
  code,
  id,
  tooltip,
}: {
  title: string;
  code: string;
  id: string;
  tooltip: string;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-gray-500">{title}</span>
      <button
        id={id}
        type="button"
        className="w-full text-left p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono break-all cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => navigator.clipboard.writeText(code)}
        title={tooltip}
        aria-label={`Copy ${title} code`}
      >
        {code}
      </button>
    </div>
  );
}

export default function CssGenerator({ lng }: CssGeneratorProps) {
  const { t } = useTranslation(lng, 'css-generator');
  const [activeTab, setActiveTab] = useState<'shadow' | 'gradient'>('shadow');
  const baseId = useId();

  // Shadow State
  const [shadow, setShadow] = useState({
    x: 0,
    y: 4,
    blur: 6,
    spread: -1,
    color: '#000000',
    opacity: 0.1,
  });

  // Gradient State
  const [gradient, setGradient] = useState({
    type: 'linear',
    direction: 'to right',
    from: '#3b82f6', // blue-500
    to: '#ef4444', // red-500
  });

  // Shadow Logic
  const shadowColorHexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const shadowCss = `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${
    shadow.spread
  }px ${shadowColorHexToRgba(shadow.color, shadow.opacity)}`;
  const shadowTailwind = `shadow-[${shadow.x}px_${shadow.y}px_${shadow.blur}px_${
    shadow.spread
  }px_${shadowColorHexToRgba(shadow.color, shadow.opacity).replace(/ /g, '')}]`;

  // Gradient Logic
  const gradientCssValid = `linear-gradient(${gradient.direction}, ${gradient.from}, ${gradient.to})`;
  const gradientTailwind = `bg-[linear-gradient(${gradient.direction.replace(' ', '_')},${
    gradient.from
  },${gradient.to})]`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'shadow'
              ? 'border-b-2 border-point-1 text-point-1'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('shadow')}
        >
          {t('tab.shadow')}
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'gradient'
              ? 'border-b-2 border-point-1 text-point-1'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveTab('gradient')}
        >
          {t('tab.gradient')}
        </button>
      </div>

      {activeTab === 'shadow' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <Control
                id={`${baseId}-shadow-x`}
                label={t('shadow.offsetX')}
                value={shadow.x}
                min={-100}
                max={100}
                onChange={(v) => setShadow({ ...shadow, x: v })}
              />
              <Control
                id={`${baseId}-shadow-y`}
                label={t('shadow.offsetY')}
                value={shadow.y}
                min={-100}
                max={100}
                onChange={(v) => setShadow({ ...shadow, y: v })}
              />
              <Control
                id={`${baseId}-shadow-blur`}
                label={t('shadow.blur')}
                value={shadow.blur}
                min={0}
                max={100}
                onChange={(v) => setShadow({ ...shadow, blur: v })}
              />
              <Control
                id={`${baseId}-shadow-spread`}
                label={t('shadow.spread')}
                value={shadow.spread}
                min={-100}
                max={100}
                onChange={(v) => setShadow({ ...shadow, spread: v })}
              />
              <div className="space-y-1">
                <label
                  htmlFor={`${baseId}-shadow-color`}
                  className="text-xs font-medium text-gray-500 block"
                >
                  {t('shadow.color')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`${baseId}-shadow-color`}
                    type="color"
                    title={t('shadow.color')}
                    value={shadow.color}
                    onChange={(e) => setShadow({ ...shadow, color: e.target.value })}
                    className="h-8 w-8 rounded cursor-pointer"
                  />
                  <Input
                    type="number"
                    value={shadow.opacity}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={(e) =>
                      setShadow({
                        ...shadow,
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="w-20"
                    aria-label={t('shadow.opacity')}
                  />
                  <span className="text-sm text-gray-500">{t('shadow.opacity')}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor={`${baseId}-gradient-direction`}
                  className="text-xs font-medium text-gray-500 block"
                >
                  {t('gradient.direction')}
                </label>
                <select
                  id={`${baseId}-gradient-direction`}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  value={gradient.direction}
                  onChange={(e) => setGradient({ ...gradient, direction: e.target.value })}
                >
                  <option value="to right">{t('gradient.toRight')}</option>
                  <option value="to left">{t('gradient.toLeft')}</option>
                  <option value="to bottom">{t('gradient.toBottom')}</option>
                  <option value="to top">{t('gradient.toTop')}</option>
                  <option value="to bottom right">{t('gradient.toBottomRight')}</option>
                  <option value="to top right">{t('gradient.toTopRight')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={`${baseId}-gradient-from`}
                  className="text-xs font-medium text-gray-500 block"
                >
                  {t('gradient.from')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`${baseId}-gradient-from`}
                    type="color"
                    title={t('gradient.from')}
                    value={gradient.from}
                    onChange={(e) => setGradient({ ...gradient, from: e.target.value })}
                    className="h-8 w-8 rounded cursor-pointer"
                  />
                  <Input
                    value={gradient.from}
                    onChange={(e) => setGradient({ ...gradient, from: e.target.value })}
                    aria-label={t('gradient.from')}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={`${baseId}-gradient-to`}
                  className="text-xs font-medium text-gray-500 block"
                >
                  {t('gradient.to')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`${baseId}-gradient-to`}
                    type="color"
                    title={t('gradient.to')}
                    value={gradient.to}
                    onChange={(e) => setGradient({ ...gradient, to: e.target.value })}
                    className="h-8 w-8 rounded cursor-pointer"
                  />
                  <Input
                    value={gradient.to}
                    onChange={(e) => setGradient({ ...gradient, to: e.target.value })}
                    aria-label={t('gradient.to')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="w-48 h-48 rounded-lg" style={{ background: gradientCssValid }} />
            </div>
            <CodeBlock
              id={`${baseId}-code-grad-css`}
              title={t('code.css')}
              code={`background: ${gradientCssValid};`}
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
