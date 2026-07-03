'use client';

import React from 'react';
import { Language } from '~/app/i18n/settings';
import GuestbookList from '@components/guestbook/GuestbookList';

type GuestbookClientProps = {
  lng: Language;
};

export default function GuestbookClient({ lng }: GuestbookClientProps) {
  return <GuestbookList lng={lng} />;
}
