import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { languages } from '~/app/i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'choseong-maker' });

export default function ChoseongMakerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
