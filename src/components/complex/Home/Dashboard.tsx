'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from '@components/basic/Link';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

type DashboardProps = {
  lng: Language;
  user: any;
};

export default function Dashboard({ lng, user }: DashboardProps) {
  const { t } = useTranslation(lng, 'index');

  const links = [
    { key: 'blog', href: `/${lng}/blog` },
    { key: 'multi', href: `/${lng}/multi-live` },
    { key: 'todo', href: `/${lng}/todo` },
  ];

  if (user?.role === 'ADMIN') {
    links.push({ key: 'admin', href: `/${lng}/admin`, title: 'Admin' });
  }

  return (
    <section className="px-6 py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mb-6 dark:text-white"
      >
        Dashboard
      </motion.h2>
      <div className="grid gap-4 md:grid-cols-3">
        {links.map((link, idx) => (
          <motion.div
            key={link.key}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="p-4 rounded-lg bg-white dark:bg-zinc-800 shadow flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-2 dark:text-white">
              {link.key === 'admin' ? link.title : t(`features.${link.key}.title`)}
            </h3>
            {link.key !== 'admin' && (
              <p className="t-d-1 t-basic-3 mb-4">
                {t(`features.${link.key}.desc`)}
              </p>
            )}
            <Link href={link.href} className="mt-auto text-point-1 underline">
              {t('action')}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

