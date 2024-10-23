'use client';

import React, { useState, useCallback } from 'react';
import Select from '@components/complex/Select';
import { useRouter } from 'next/navigation';
import { useTranslation } from '~/app/i18n/client';
import { LiveType, platformMapper } from '@utils/liveTypes';
import { MultiLiveProps } from '~/app/[lng]/multi-live/[[...slug]]/layout';

const MultiLivePopUp = ({ params: { lng, slug } }: MultiLiveProps) => {
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
      <div className="fixed flex bottom-4 left-4 bg-basic-0 p-2 rounded-lg gap-2">
        <Select
          value={newLiveType}
          onChange={(value) => setNewLiveType(value as LiveType)}
          className="w-24"
        >
          {Object.values(platformMapper).map((type) => (
            <option key={type} value={type}>
              {t(type)}
            </option>
          ))}
        </Select>
        <input
          className="input-text"
          value={liveId}
          onChange={(e) => setLiveId(e.target.value)}
          placeholder={t('input-placeholder')}
        />
        <button className="button" onClick={onSubmit}>
          {t('add')}
        </button>
        <button className="button bg-red-400 hover:bg-red-500" onClick={closePopUp}>
          {t('close')}
        </button>
      </div>
    )
  );
};

export default MultiLivePopUp;
