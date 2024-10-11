'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';

function LocalesNav() {
  const pathname = usePathname();
  if (pathname === null) return null;

  // Determine the current language and toggle it
  const currentLang = pathname.startsWith('/ko') ? 'ko' : 'en';
  const newLang = currentLang === 'ko' ? 'en' : 'ko';
  const newPathname = pathname.replace(/^\/(ko|en)/, `/${newLang}`);

  return (
    <a
      className={
        'w-[57px] h-[57px] mb-safe flex justify-center items-center cursor-pointer fixed z-30 bottom-[77px] right-5 bg-zinc-100 dark:bg-zinc-800 lg:bottom-[340px] lg:right-5 lg:left-auto rounded-full shadow-md t-d-3 t-basic-1'
      }
      href={newPathname}
      onClick={() => sendGAEvent('link_click', 'change_language')}
    >
      {'KO/EN'}
    </a>
  );
}

export default LocalesNav;
