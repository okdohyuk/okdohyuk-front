import { headers } from 'next/headers';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import { useTranslation } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'myip' });

export const dynamic = 'force-dynamic';

export default async function MyIpPage({ params }: LanguageParams) {
  const { lng } = await params;
  const { t } = await useTranslation(lng, 'myip');

  const ip =
    headers().get('x-forwarded-for')?.split(',')[0] ||
    headers().get('x-real-ip') ||
    '';

  const res = await fetch(`https://ipapi.co/${ip}/json/`, { cache: 'no-store' });
  const data = await res.json();

  const items: [string, any][] = [
    ['ip', data.ip || ip],
    ['city', data.city],
    ['region', data.region],
    ['country', data.country_name || data.country],
    ['postal', data.postal],
    ['timezone', data.timezone],
    ['org', data.org],
    ['latitude', data.latitude],
    ['longitude', data.longitude],
  ];

  return (
    <>
      <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
      <div className="bg-basic-3 rounded-md p-4 t-d-1 t-basic-1 space-y-2">
        {items.map(([key, value]) => (
          <div key={key}>
            {t(key as any)}: {value ?? '-'}
          </div>
        ))}
      </div>
    </>
  );
}

