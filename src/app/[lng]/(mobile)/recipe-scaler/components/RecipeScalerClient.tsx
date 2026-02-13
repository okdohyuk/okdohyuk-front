'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { H3, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { scaleIngredientText } from '../utils/scaleIngredients';

type RecipeScalerClientProps = {
  lng: Language;
};

function RecipeScalerClient({ lng }: RecipeScalerClientProps) {
  const { t } = useTranslation(lng, 'recipe-scaler');
  const [originalServings, setOriginalServings] = useState('2');
  const [targetServings, setTargetServings] = useState('4');
  const [ingredients, setIngredients] = useState('');
  const [copyLabel, setCopyLabel] = useState(t('actions.copy'));

  const ratio = useMemo(() => {
    const original = Number(originalServings);
    const target = Number(targetServings);

    if (!original || !target || original <= 0 || target <= 0) {
      return null;
    }

    return target / original;
  }, [originalServings, targetServings]);

  const scaledIngredients = useMemo(() => {
    if (!ratio || !ingredients.trim()) return '';
    return scaleIngredientText(ingredients, ratio);
  }, [ingredients, ratio]);

  const handleCopy = async () => {
    if (!scaledIngredients) return;
    await navigator.clipboard.writeText(scaledIngredients);
    setCopyLabel(t('actions.copied'));
    setTimeout(() => setCopyLabel(t('actions.copy')), 1500);
  };

  const handleClear = () => {
    setIngredients('');
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between">
          <H3>{t('label.servings')}</H3>
          <Text variant="c1" color="basic-5">
            {t('helper.ratioHint')}
          </Text>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="recipe-original-servings" className="space-y-2">
            <Text variant="d2" color="basic-4">
              {t('label.originalServings')}
            </Text>
            <Input
              id="recipe-original-servings"
              type="text"
              inputMode="numeric"
              placeholder={t('placeholder.servings')}
              value={originalServings}
              onChange={(event) => setOriginalServings(event.target.value)}
            />
          </label>
          <label htmlFor="recipe-target-servings" className="space-y-2">
            <Text variant="d2" color="basic-4">
              {t('label.targetServings')}
            </Text>
            <Input
              id="recipe-target-servings"
              type="text"
              inputMode="numeric"
              placeholder={t('placeholder.servings')}
              value={targetServings}
              onChange={(event) => setTargetServings(event.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Text variant="d2" color="basic-5">
            {t('label.ratio')}
          </Text>
          <Text variant="d2" color={ratio ? 'basic-2' : 'basic-6'}>
            {ratio ? ratio.toFixed(2).replace(/\.00$/, '') : t('helper.invalidServings')}
          </Text>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between">
          <H3>{t('label.ingredients')}</H3>
          <Button size="sm" variant="ghost" onClick={handleClear}>
            {t('actions.clear')}
          </Button>
        </div>
        <Textarea
          rows={6}
          placeholder={t('placeholder.ingredients')}
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
        />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <H3>{t('label.result')}</H3>
            <Button size="sm" onClick={handleCopy} disabled={!scaledIngredients}>
              {copyLabel}
            </Button>
          </div>
          <Textarea rows={6} value={scaledIngredients} readOnly />
          <Text variant="c1" color="basic-5">
            {scaledIngredients ? t('helper.copyHint') : t('helper.emptyResult')}
          </Text>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <H3>{t('label.example')}</H3>
        <Text variant="d2" color="basic-4">
          {t('helper.exampleText')}
        </Text>
      </div>
    </div>
  );
}

export default RecipeScalerClient;
