'use client';

import React from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import TextStatsPanel from './TextStatsPanel';
import CaseConverterPanel from './CaseConverterPanel';
import LineOrganizerPanel from './LineOrganizerPanel';

interface TextToolkitClientProps {
  lng: Language;
}

export default function TextToolkitClient({ lng }: TextToolkitClientProps) {
  const { t } = useTranslation(lng, 'text-toolkit');

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4')}>
        <TextStatsPanel t={t} />
      </section>
      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4')}>
        <CaseConverterPanel t={t} />
      </section>
      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4')}>
        <LineOrganizerPanel t={t} />
      </section>
    </div>
  );
}
