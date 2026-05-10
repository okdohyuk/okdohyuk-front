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
      <article className="rounded-lg p-4 md:p-8 lg:min-h-[144px] transition-all bg-basic-3 shadow-xl text-cyan-500 border-2 border-transparent hover:border-current">
        <div className="flex gap-2 justify-between items-center">
          <div className="text-2xl font-extrabold ">{title}</div>
        </div>
        <div className="text-sm mt-2 text-fg-0">{explanation}</div>
      </article>
    </Link>
  );
}

export default MyLinkCard;
