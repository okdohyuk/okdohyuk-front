import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { ChildrenProps } from '~/app/[lng]/layout';
import { languages } from '~/app/i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'coder' });

export default function CoderLayout({ children }: ChildrenProps) {
  return children;
}
