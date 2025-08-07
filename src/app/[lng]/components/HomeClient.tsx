'use client';

import React from 'react';
import { observer } from 'mobx-react';
import { motion } from 'framer-motion';
import Image from 'next/legacy/image';
import logoIcon from '../../../../public/logo.svg';
import Link from '@components/basic/Link';
import useStore from '@hooks/useStore';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { User } from '@api/User';

interface Props {
  lng: Language;
}

function HomeClient({ lng }: Props) {
  const { user } = useStore('userStore');
  return user ? <Dashboard lng={lng} user={user} /> : <Intro lng={lng} />;
}

function Intro({ lng }: { lng: Language }) {
  const { t } = useTranslation(lng, 'index');
  const features = [
    {
      title: t('features.blogTitle'),
      desc: t('features.blogDesc'),
      href: '/blog',
    },
    {
      title: t('features.multiLiveTitle'),
      desc: t('features.multiLiveDesc'),
      href: '/multi-live',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-black t-t-1"
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-white to-point-1">
          {t('domain')}
        </span>
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="t-t-2 max-w-md dark:text-white"
      >
        {t('title')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="t-d-1 t-basic-3"
      >
        {t('subTitle')}
      </motion.p>

      <div className="flex justify-center mt-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Image priority src={logoIcon} alt={'logo'} width={250} height={250} />
        </motion.div>
      </div>

      <div className="grid gap-6 mt-10 w-full max-w-4xl md:grid-cols-2">
        {features.map((f, idx) => (
          <motion.div
            key={f.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-lg bg-basic-3 dark:bg-basic-4 text-left"
          >
            <Link href={f.href} className="block">
              <h3 className="t-t-3 mb-2">{f.title}</h3>
              <p className="t-d-1 t-basic-3">{f.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ lng, user }: { lng: Language; user: User }) {
  const { t } = useTranslation(lng, 'index');
  const links = [
    { href: '/blog', label: t('features.blogTitle') },
    { href: '/multi-live', label: t('features.multiLiveTitle') },
  ];
  if (user.role === 'ADMIN') {
    links.push({ href: '/admin', label: t('features.adminTitle') });
  }

  return (
    <div className="px-4 py-12 flex flex-col gap-8 items-center text-center">
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="t-t-2">
        {t('dashboard.welcome', { name: user.name })}
      </motion.h2>
      <div className="grid gap-4 w-full max-w-4xl md:grid-cols-3">
        {links.map((l, idx) => (
          <motion.div
            key={l.href}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-lg bg-basic-3 dark:bg-basic-4"
          >
            <Link href={l.href} className="block">
              {l.label}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default observer(HomeClient);
