'use client';

import React from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { SERVICE_PANEL, SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

type PackingChecklistClientProps = {
  lng: Language;
};

type ChecklistItem = {
  id: string;
  label: string;
  category: string;
  packed: boolean;
  custom: boolean;
};

const categoryOrder = ['essentials', 'clothing', 'toiletries', 'tech', 'documents', 'optional'];

const templateOrder = ['dayTrip', 'weekend', 'week', 'business'];

const buildChecklist = (
  templateKey: string,
  templateItems: Record<string, string[]>,
): ChecklistItem[] => {
  return categoryOrder.flatMap((category) => {
    const items = templateItems?.[category] ?? [];
    return items.map((label, index) => ({
      id: `${templateKey}-${category}-${index}`,
      label,
      category,
      packed: false,
      custom: false,
    }));
  });
};

export default function PackingChecklistClient({ lng }: PackingChecklistClientProps) {
  const { t } = useTranslation(lng, 'packing-checklist');
  const [templateKey, setTemplateKey] = React.useState<string>('weekend');
  const [customCategory, setCustomCategory] = React.useState<string>('essentials');
  const [customInput, setCustomInput] = React.useState<string>('');
  const [copyMessage, setCopyMessage] = React.useState<string>('');

  const templateItems = t(`items.${templateKey}`, { returnObjects: true }) as Record<
    string,
    string[]
  >;

  const categories = categoryOrder.map((key) => ({
    key,
    label: t(`categories.${key}`),
  }));

  const templates = templateOrder.map((key) => ({
    key,
    label: t(`templates.${key}`),
  }));

  const [items, setItems] = React.useState<ChecklistItem[]>(() =>
    buildChecklist(templateKey, templateItems),
  );

  React.useEffect(() => {
    setItems(buildChecklist(templateKey, templateItems));
  }, [templateKey, templateItems]);

  const packedCount = items.filter((item) => item.packed).length;
  const totalCount = items.length;
  const remainingCount = totalCount - packedCount;

  const togglePacked = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item)),
    );
  };

  const handleAddItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    setItems((prev) => [
      ...prev,
      {
        id: `${customCategory}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        label: trimmed,
        category: customCategory,
        packed: false,
        custom: true,
      },
    ]);
    setCustomInput('');
  };

  const handleReset = () => {
    setItems(buildChecklist(templateKey, templateItems));
  };

  const handleClearPacked = () => {
    setItems((prev) => prev.map((item) => ({ ...item, packed: false })));
  };

  const handleMarkAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, packed: true })));
  };

  const handleCopy = async (mode: 'all' | 'remaining') => {
    const filtered = mode === 'remaining' ? items.filter((item) => !item.packed) : items;
    const grouped = categoryOrder
      .map((category) => {
        const categoryLabel = t(`categories.${category}`);
        const lines = filtered
          .filter((item) => item.category === category)
          .map((item) => `- ${item.label}`);
        if (!lines.length) return null;
        return `${categoryLabel}\n${lines.join('\n')}`;
      })
      .filter(Boolean)
      .join('\n\n');

    if (!grouped) return;

    try {
      await navigator.clipboard.writeText(grouped);
      setCopyMessage(mode === 'remaining' ? t('copy.remainingDone') : t('copy.allDone'));
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (error) {
      setCopyMessage(t('copy.failed'));
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const groupedItems = categoryOrder.map((category) => ({
    category,
    label: t(`categories.${category}`),
    items: items.filter((item) => item.category === category),
  }));

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL} space-y-4 p-4`}>
        <div className="space-y-2">
          <Text variant="t3">{t('sections.template')}</Text>
          <Select value={templateKey} onValueChange={setTemplateKey}>
            <SelectTrigger aria-label={t('sections.template')}>
              <SelectValue placeholder={t('placeholders.template')} />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.key} value={template.key}>
                  {template.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Text variant="c1" color="basic-4">
            {t('helper.template')}
          </Text>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={`${SERVICE_PANEL_SOFT} p-2`}>
            <Text variant="c1" color="basic-4">
              {t('summary.total')}
            </Text>
            <Text variant="t3">{totalCount}</Text>
          </div>
          <div className={`${SERVICE_PANEL_SOFT} p-2`}>
            <Text variant="c1" color="basic-4">
              {t('summary.packed')}
            </Text>
            <Text variant="t3">{packedCount}</Text>
          </div>
          <div className={`${SERVICE_PANEL_SOFT} p-2`}>
            <Text variant="c1" color="basic-4">
              {t('summary.remaining')}
            </Text>
            <Text variant="t3">{remainingCount}</Text>
          </div>
        </div>
      </section>

      <section className={`${SERVICE_PANEL} space-y-4 p-4`}>
        <div className="space-y-2">
          <Text variant="t3">{t('sections.addItem')}</Text>
          <form onSubmit={handleAddItem} className="flex flex-col gap-2">
            <div className="grid gap-2 md:grid-cols-[140px_1fr]">
              <Select value={customCategory} onValueChange={setCustomCategory}>
                <SelectTrigger aria-label={t('placeholders.category')}>
                  <SelectValue placeholder={t('placeholders.category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.key} value={category.key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={t('placeholders.item')}
                value={customInput}
                onChange={(event) => setCustomInput(event.target.value)}
              />
            </div>
            <Button type="submit">{t('actions.add')}</Button>
          </form>
        </div>
      </section>

      <section className={`${SERVICE_PANEL} space-y-4 p-4`}>
        <div className="space-y-2">
          <Text variant="t3">{t('sections.list')}</Text>
          <Text variant="c1" color="basic-4">
            {t('helper.checklist')}
          </Text>
        </div>
        <div className="space-y-3">
          {groupedItems.map((group) => (
            <div key={group.category} className="space-y-2">
              <Text variant="d1" className="font-semibold">
                {group.label}
              </Text>
              {group.items.length ? (
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className={`${SERVICE_PANEL_SOFT} flex items-center gap-2 p-2`}
                    >
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() => togglePacked(item.id)}
                        className="h-4 w-4 accent-point-1"
                      />
                      <Text
                        variant="d2"
                        className={item.packed ? 'line-through text-zinc-400' : ''}
                      >
                        {item.label}
                      </Text>
                      {item.custom ? (
                        <Text variant="c2" color="basic-5" className="ml-auto">
                          {t('labels.custom')}
                        </Text>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <Text variant="c1" color="basic-5">
                  {t('empty')}
                </Text>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={`${SERVICE_PANEL} space-y-3 p-4`}>
        <Text variant="t3">{t('sections.actions')}</Text>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={handleReset}>
            {t('actions.reset')}
          </Button>
          <Button type="button" onClick={handleClearPacked}>
            {t('actions.clearPacked')}
          </Button>
          <Button type="button" onClick={handleMarkAll}>
            {t('actions.markAll')}
          </Button>
          <Button type="button" onClick={() => handleCopy('remaining')}>
            {t('actions.copyRemaining')}
          </Button>
          <Button type="button" onClick={() => handleCopy('all')}>
            {t('actions.copyAll')}
          </Button>
        </div>
        {copyMessage ? (
          <Text variant="c1" color="basic-4">
            {copyMessage}
          </Text>
        ) : null}
      </section>
    </div>
  );
}
