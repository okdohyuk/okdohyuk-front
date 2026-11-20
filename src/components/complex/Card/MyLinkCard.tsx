import React from 'react';
import Link from '~/components/basic/Link';

type LinkCard = {
  title: string;
  explanation: string;
  link: string;
};

function MyLinkCard({ link, explanation, title }: LinkCard) {
  return (
    <Link href={link} hasTargetBlank>
      <article className="rounded-xl border border-basic-3 bg-basic-0 p-4 transition-colors duration-150 hover:border-basic-4 md:p-6 lg:min-h-36 dark:bg-basic-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-medium text-fg-1">{title}</div>
        </div>
        <div className="mt-2 text-sm text-fg-4">{explanation}</div>
      </article>
    </Link>
  );
}

export default MyLinkCard;
