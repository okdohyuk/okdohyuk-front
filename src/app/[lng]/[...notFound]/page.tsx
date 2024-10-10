import { notFound } from 'next/navigation';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'notFound' });

const CatchAll = () => {
  return notFound();
};

export default CatchAll;
