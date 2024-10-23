import { notFound } from 'next/navigation';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'notFound' });

export default function CatchAll() {
  return notFound();
}
