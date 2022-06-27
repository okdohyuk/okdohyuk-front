import React from 'react';
import Link from '@components/Link';

type LinkCard = {
  title: string;
  explanation: string;
  link: string;
};

function MyLinkCard(props: LinkCard): any {
  return (
    <Link href={props.link} hasTargetBlank>
      <article className="rounded-lg p-4 md:p-8 transition-all bg-zinc-300 dark:bg-zinc-800 shadow-xl dark:shadow-lg text-cyan-500 border-2 border-transparent hover:border-current">
        <div className="flex gap-2 justify-between items-center">
          <div className="text-2xl font-extrabold ">{props.title}</div>
        </div>
        <div className="text-sm mt-2 text-black dark:text-white">{props.explanation}</div>
      </article>
    </Link>
  );
}

export default MyLinkCard;
