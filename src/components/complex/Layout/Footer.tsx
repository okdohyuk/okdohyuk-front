'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import ClassName from '@utils/classNameUtils';

interface FooterProps {
  lng: Language;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ lng, className = '' }) => {
  const { t } = useTranslation(lng, 'common');
  const { cls } = ClassName;

  const currentYear = new Date().getFullYear();
  const linkClassName = 'hover:text-blue-700 dark:hover:text-blue-300 transition-colors';
  const separatorClassName = 'mx-2 text-zinc-400 dark:text-zinc-600';

  return (
    <footer
      className={cls(
        'w-full py-4 border-t border-zinc-200 dark:border-zinc-800',
        'bg-zinc-100 dark:bg-zinc-900',
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p className="flex items-center justify-center">
            <span>
              © {currentYear} {t('footer.appName')}
            </span>
            <span className={separatorClassName}>|</span>
            <Link
              href={`${process.env.NEXT_PUBLIC_POLICY_URL || '#'}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {t('footer.terms')}
            </Link>
            <span className={separatorClassName}>·</span>
            <Link
              href={`${process.env.NEXT_PUBLIC_PRIVACY_URL || '#'}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              {t('footer.privacy')}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
