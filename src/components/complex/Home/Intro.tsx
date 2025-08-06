'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/legacy/image';
import InstallApp from '@components/complex/InstallApp';
import Link from '@components/basic/Link';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import logoIcon from '../../../../public/logo.svg';

type IntroProps = {
  lng: Language;
};

export default function Intro({ lng }: IntroProps) {
  const { t } = useTranslation(lng, 'index');

  const features = [
    { key: 'blog', href: `/${lng}/blog` },
    { key: 'multi', href: `/${lng}/multi-live` },
    { key: 'todo', href: `/${lng}/todo` },
  ];

  return (
    <>
      <InstallApp text={t('downloads')} />

      <section className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-black t-t-1"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-white-500 to-point-1">
            {t('domain')}
          </span>
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="t-t-2 max-w-md dark:text-white"
        >
          {t('title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="t-d-1 t-basic-3"
        >
          {t('subTitle')}
        </motion.p>
      </section>

      <section className="flex justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image priority src={logoIcon} alt={'logo'} width={250} height={250} />
        </motion.div>
      </section>

      <section className="grid gap-8 px-6 py-12 md:grid-cols-3">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.key}
            className="p-6 rounded-xl bg-white dark:bg-zinc-800 shadow flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-xl font-bold mb-2 dark:text-white">
              {t(`features.${feature.key}.title`)}
            </h3>
            <p className="t-d-1 t-basic-3 mb-4">
              {t(`features.${feature.key}.desc`)}
            </p>
            <Link href={feature.href} className="mt-auto text-point-1 underline">
              {t('action')}
            </Link>
          </motion.div>
        ))}
      </section>
    </>
  );
}

