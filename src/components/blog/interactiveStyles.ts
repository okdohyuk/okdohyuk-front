/*
 * Blog surfaces (unslop 2026-11-19).
 *
 * One layer, same card as the tool pages: hairline border, no backdrop blur, no shadow.
 * Cards 16px (rounded-2xl), so anything inset by 4px uses rounded-xl (12px) and by 8px
 * rounded-lg (8–10px). Hover is a border step only — never a lift, scale or glow.
 */

/** Article body, post header, list panels. */
export const BLOG_PANEL = 'rounded-2xl border border-basic-3 bg-basic-0 dark:bg-basic-1';

/** Card body inside a link. Pair with `group` on the link for the hover border. */
export const BLOG_CARD =
  'rounded-2xl border border-basic-3 bg-basic-0 transition-colors duration-150 ease-out group-hover:border-basic-4 dark:bg-basic-1';

/** Link wrapping a card: owns the focus ring, carries `group` for the card hover. */
export const BLOG_CARD_LINK = 'group block rounded-2xl focus-ring';

/** Muted meta line under titles: dates, counts, tags. Mono figures, tabular. */
export const BLOG_META = 'text-xs leading-4 text-fg-5';
