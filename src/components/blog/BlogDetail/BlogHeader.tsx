import React from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from '@components/basic/Link';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import { BLOG_META } from '@components/blog/interactiveStyles';
import ServicePageMeta from '@components/complex/Service/ServicePageMeta';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import ViewCount from './ViewCount';

const parseSafeDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

function MetaDot() {
  return (
    <span aria-hidden className="text-fg-6">
      ·
    </span>
  );
}

/*
 * Post header on the page canvas: the site's mono path signature (same row as tool headers),
 * a size-led title, one muted meta line
 * (category trail · dates · views), then the cover as a plain framed figure. The cover is
 * shown as-is — no colour overlay or scrim, and no text is laid over it.
 */
function BlogHeader() {
  const { blog, lng } = useBlogDetail();
  const { t } = useTranslation(lng, 'blog/index');
  const { thumbnailImage, title, createdAt, updatedAt, categoryChain } = blog;
  const createdDate = parseSafeDate(createdAt) ?? new Date();
  const updatedDate = parseSafeDate(updatedAt);
  const createdFormatted = format(createdDate, 'yyyy-MM-dd');
  const updatedFormatted = updatedDate ? format(updatedDate, 'yyyy-MM-dd') : null;
  const hasDistinctUpdatedDate = Boolean(
    updatedDate && updatedFormatted && updatedFormatted !== createdFormatted,
  );
  const effectiveModifiedIso = (updatedDate ?? createdDate).toISOString();
  const categories = categoryChain ?? [];

  return (
    <header className="mb-8">
      <ServicePageMeta />
      <h1
        itemProp="headline"
        className="mt-3 text-3xl font-semibold leading-tight text-fg-1 md:text-4xl"
      >
        {title}
      </h1>

      <div className={cn(BLOG_META, 'mt-4 flex flex-wrap items-center gap-x-2 gap-y-1')}>
        {categories.length > 0 ? (
          <>
            <nav aria-label={t('filter.category')} className="flex flex-wrap items-center gap-1">
              {categories.map((category, index) => (
                <React.Fragment key={category}>
                  {index > 0 ? (
                    <span aria-hidden className="text-fg-6">
                      /
                    </span>
                  ) : null}
                  <Link
                    href={`/blog?categoryIn=${categories.slice(0, index + 1).join(',')}`}
                    className="rounded-xs text-fg-4 transition-colors duration-150 hover:text-fg-1 focus-ring"
                  >
                    {category}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
            <MetaDot />
          </>
        ) : null}

        <time
          dateTime={createdDate.toISOString()}
          itemProp="datePublished"
          className="font-mono tabular-nums"
        >
          {createdFormatted}
        </time>

        {hasDistinctUpdatedDate && updatedDate ? (
          <>
            <MetaDot />
            <span>
              {t('updated')}{' '}
              <time
                dateTime={updatedDate.toISOString()}
                itemProp="dateModified"
                className="font-mono tabular-nums"
              >
                {updatedFormatted}
              </time>
            </span>
          </>
        ) : (
          <meta itemProp="dateModified" content={effectiveModifiedIso} />
        )}

        <MetaDot />
        <ViewCount />
      </div>

      {thumbnailImage ? (
        // Panel 16px radius, image clipped by it — no inner padding, so no nested radius.
        <figure className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl border border-basic-3 bg-basic-1">
          <Image
            src={`${thumbnailImage}?w=1280`}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
            unoptimized
          />
        </figure>
      ) : null}
    </header>
  );
}

export default BlogHeader;
