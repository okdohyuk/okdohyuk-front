import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'todo' });

export default function TodoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
