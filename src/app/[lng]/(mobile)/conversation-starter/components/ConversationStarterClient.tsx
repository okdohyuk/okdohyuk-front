'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { Copy, RefreshCcw, Trash2 } from 'lucide-react';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type Category = {
  id: string;
  title: string;
  description: string;
  promptKeys: string[];
};

const HISTORY_LIMIT = 6;

interface ConversationStarterClientProps {
  lng: Language;
}

export default function ConversationStarterClient({ lng }: ConversationStarterClientProps) {
  const { t } = useTranslation(lng, 'conversation-starter');
  const [categoryId, setCategoryId] = useState('all');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const baseCategories = useMemo<Category[]>(
    () => [
      {
        id: 'ice',
        title: t('category.ice.title'),
        description: t('category.ice.description'),
        promptKeys: [
          'prompt.ice.1',
          'prompt.ice.2',
          'prompt.ice.3',
          'prompt.ice.4',
          'prompt.ice.5',
        ],
      },
      {
        id: 'friends',
        title: t('category.friends.title'),
        description: t('category.friends.description'),
        promptKeys: [
          'prompt.friends.1',
          'prompt.friends.2',
          'prompt.friends.3',
          'prompt.friends.4',
          'prompt.friends.5',
        ],
      },
      {
        id: 'family',
        title: t('category.family.title'),
        description: t('category.family.description'),
        promptKeys: [
          'prompt.family.1',
          'prompt.family.2',
          'prompt.family.3',
          'prompt.family.4',
          'prompt.family.5',
        ],
      },
      {
        id: 'self',
        title: t('category.self.title'),
        description: t('category.self.description'),
        promptKeys: [
          'prompt.self.1',
          'prompt.self.2',
          'prompt.self.3',
          'prompt.self.4',
          'prompt.self.5',
        ],
      },
    ],
    [t],
  );

  const categories = useMemo<Category[]>(() => {
    const allPrompts = baseCategories.flatMap((category) => category.promptKeys);
    return [
      {
        id: 'all',
        title: t('category.all.title'),
        description: t('category.all.description'),
        promptKeys: allPrompts,
      },
      ...baseCategories,
    ];
  }, [baseCategories, t]);

  const activeCategory = categories.find((category) => category.id === categoryId) ?? categories[0];
  const translate = t as (key: string) => string;
  const promptPool = activeCategory.promptKeys.map((key) => translate(key));

  const pickPrompt = () => {
    if (!promptPool.length) {
      return;
    }

    let nextPrompt = promptPool[Math.floor(Math.random() * promptPool.length)];
    if (promptPool.length > 1) {
      let guard = 0;
      while (nextPrompt === currentPrompt && guard < 5) {
        nextPrompt = promptPool[Math.floor(Math.random() * promptPool.length)];
        guard += 1;
      }
    }

    setCurrentPrompt(nextPrompt);
    setCopied(false);
    setHistory((prev) =>
      [nextPrompt, ...prev.filter((item) => item !== nextPrompt)].slice(0, HISTORY_LIMIT),
    );
  };

  const resetAll = () => {
    setCurrentPrompt('');
    setHistory([]);
    setCopied(false);
  };

  const copyPrompt = async () => {
    if (!currentPrompt) {
      return;
    }
    try {
      await navigator.clipboard.writeText(currentPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text asChild variant="d2" color="basic-4">
          <p>{t('label.category')}</p>
        </Text>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category.id === categoryId;
            return (
              <Button
                key={category.id}
                type="button"
                onClick={() => {
                  setCategoryId(category.id);
                  setCurrentPrompt('');
                  setCopied(false);
                }}
                className={cn(
                  'px-3 py-2 text-sm',
                  isActive
                    ? 'bg-point-2 text-white'
                    : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
                )}
              >
                {category.title}
              </Button>
            );
          })}
        </div>
        <Text asChild variant="d3" color="basic-5">
          <p>{activeCategory.description}</p>
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-5')}>
        <div className="flex items-center justify-between gap-2">
          <Text asChild variant="d2" color="basic-2">
            <p>{t('label.current')}</p>
          </Text>
          <div className="flex gap-2">
            <Button type="button" onClick={pickPrompt} className="px-3 py-2 text-sm">
              <RefreshCcw className="mr-1" size={16} />
              {currentPrompt ? t('button.next') : t('button.pick')}
            </Button>
            <Button
              type="button"
              onClick={copyPrompt}
              className="px-3 py-2 text-sm bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              disabled={!currentPrompt}
            >
              <Copy className="mr-1" size={16} />
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/60 px-4 py-5 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100">
          <Text asChild variant="d2" color="basic-2">
            <p>{currentPrompt || t('empty')}</p>
          </Text>
        </div>
        <Text asChild variant="c1" color="basic-5">
          <p>{t('helper')}</p>
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-5')}>
        <div className="flex items-center justify-between">
          <Text asChild variant="d2" color="basic-2">
            <p>{t('label.history')}</p>
          </Text>
          <Button
            type="button"
            onClick={resetAll}
            className="px-3 py-2 text-sm bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            disabled={!history.length && !currentPrompt}
          >
            <Trash2 className="mr-1" size={16} />
            {t('button.clear')}
          </Button>
        </div>
        {history.length ? (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-zinc-200/70 bg-white/70 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-zinc-100"
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <Text asChild variant="d3" color="basic-5">
            <p>{t('history.empty')}</p>
          </Text>
        )}
      </section>
    </div>
  );
}
