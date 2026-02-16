'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Search, X } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { HTTP_STATUS_DATA, HttpStatusCategory } from '../utils/httpStatusData';

interface HttpStatusClientProps {
  lng: Language;
}

const CATEGORY_ORDER: Array<'all' | HttpStatusCategory> = [
  'all',
  '1xx',
  '2xx',
  '3xx',
  '4xx',
  '5xx',
];

export default function HttpStatusClient({ lng }: HttpStatusClientProps) {
  const { t } = useTranslation(lng, 'http-status');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | HttpStatusCategory>('all');
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const trimmedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    return HTTP_STATUS_DATA.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!trimmedQuery) return true;
      const codeMatch = String(item.code).includes(trimmedQuery);
      const textMatch = `${item.title} ${item.description}`.toLowerCase().includes(trimmedQuery);
      return codeMatch || textMatch;
    });
  }, [category, trimmedQuery]);

  const handleCopy = async (item: (typeof HTTP_STATUS_DATA)[number]) => {
    try {
      await navigator.clipboard.writeText(`${item.code} ${item.title}`);
      setCopiedCode(item.code);
      window.setTimeout(() => setCopiedCode(null), 1500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy status code', error);
    }
  };

  const handleClear = () => {
    setQuery('');
    setCategory('all');
  };

  const emptyMessage = trimmedQuery ? t('empty.search') : t('empty.base');

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="http-status-search"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.search')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="http-status-search"
              className="pl-9 pr-10"
              placeholder={t('placeholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={t('button.clear')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? 'primary' : 'secondary'}
              onClick={() => setCategory(item)}
              className="h-8 px-3 text-xs"
            >
              {t(`category.${item}`)}
            </Button>
          ))}

          <Button
            type="button"
            variant="ghost"
            className="h-8 px-3 text-xs"
            onClick={handleClear}
            disabled={!query && category === 'all'}
          >
            {t('button.reset')}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{t('result.count', { count: results.length })}</span>
          <span>{t('result.total', { count: HTTP_STATUS_DATA.length })}</span>
        </div>

        {results.length === 0 ? (
          <div
            className={cn(
              SERVICE_PANEL_SOFT,
              'p-6 text-center text-sm text-gray-500 dark:text-gray-400',
            )}
          >
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((item) => (
              <div
                key={item.code}
                className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {item.code} · {item.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => handleCopy(item)}
                  >
                    {copiedCode === item.code ? (
                      <span className="flex items-center gap-1">
                        <ClipboardCheck className="h-4 w-4" />
                        {t('button.copied')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clipboard className="h-4 w-4" />
                        {t('button.copy')}
                      </span>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-400">
                  {t('label.category', { category: item.category })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
