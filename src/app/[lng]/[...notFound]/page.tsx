import { notFound } from 'next/navigation';
import metadata, { GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  metadata({ params, ns: 'notFound' });

const CatchAll = () => {
  return notFound();
};

export default CatchAll;
