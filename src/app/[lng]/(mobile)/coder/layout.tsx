import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import { ChildrenProps } from '~/app/[lng]/layout';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'coder' });

export default function CoderLayout({ children }: ChildrenProps) {
  return children;
}
