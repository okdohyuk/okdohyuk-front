'use client';

import React, { useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '~/app/i18n/client';
import { LiveType, platformMapper } from '@utils/liveTypes';
import { MultiLiveProps } from '~/app/[lng]/multi-live/[[...slug]]/layout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';

function MultiLivePopUp({ params }: MultiLiveProps) {
  const { lng, slug } = use(params);

  const { t } = useTranslation(lng, 'multi-live');
  const [newLiveType, setNewLiveType] = useState<LiveType>('twitch');
  const [liveId, setLiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const onSubmit = useCallback(() => {
    if (liveId) {
      const platformKey = Object.keys(platformMapper).find(
        (key) => platformMapper[key] === newLiveType,
      );
      if (platformKey) {
        const newSlug = [...(Array.isArray(slug) ? slug : []), `${platformKey}:${liveId}`];
        router.replace(`/multi-live/${newSlug.join('/')}`);
        setLiveId('');
      }
    }
  }, [liveId, newLiveType, slug, router]);

  const closePopUp = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (slug && slug.length >= 4) return null;

  return (
    isVisible && (
      <div className="fixed bottom-4 left-4 flex gap-2 rounded-lg bg-basic-0 p-2">
        <Select value={newLiveType} onValueChange={(value) => setNewLiveType(value as LiveType)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(platformMapper).map((type) => (
              <SelectItem key={type} value={type}>
                {t(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="w-40"
          value={liveId}
          onChange={(e) => setLiveId(e.target.value)}
          placeholder={t('input-placeholder')}
        />
        <Button type="button" onClick={onSubmit}>
          {t('add')}
        </Button>
        <Button type="button" className="bg-red-400 hover:bg-red-500" onClick={closePopUp}>
          {t('close')}
        </Button>
      </div>
    )
  );
}

export default MultiLivePopUp;
