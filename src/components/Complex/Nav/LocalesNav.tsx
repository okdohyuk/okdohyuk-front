import React from 'react';
import { useRouter } from 'next/router';
import Link from '@components/Basic/Link';

function LocalesNav() {
  const { asPath, locale } = useRouter();

  return (
    <Link
      className={
        'w-[57px] h-[57px] mb-safe flex justify-center items-center cursor-pointer fixed z-30 bottom-[77px] right-5 bg-zinc-100 dark:bg-zinc-800 lg:bottom-[340px] lg:right-5 lg:left-auto rounded-full shadow-md t-d-3 t-basic-1'
      }
      href={asPath}
      locale={locale === 'ko' ? 'en' : 'ko'}
    >
      {'KO/EN'}
    </Link>
  );
}

export default LocalesNav;
