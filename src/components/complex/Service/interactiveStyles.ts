/*
 * Shared tool-page surfaces (unslop 2026-11-19).
 *
 * One layer only: the page itself is not a box, each tool panel is a single card with a
 * hairline border. No backdrop blur, no large or coloured shadows. Hover is a border
 * colour step via transition-colors — never a lift, scale or glow.
 * Radius: cards rounded-2xl (16px), so controls inside a p-4 card use rounded-lg (10px).
 */

/** Tool page wrapper. Intentionally not a surface — the page background is the canvas. */
export const SERVICE_PAGE_SURFACE = 'w-full';

/** Primary panel (header-level blocks, large result areas). */
export const SERVICE_PANEL = 'rounded-2xl border border-basic-3 bg-basic-0 dark:bg-basic-1';

/** Default tool card. Same surface as SERVICE_PANEL — kept as a separate name for consumers. */
export const SERVICE_PANEL_SOFT = SERVICE_PANEL;

/**
 * Hover/focus affordance for cards. Colour-only, 150ms, visible keyboard focus ring.
 * Only for elements that are actually interactive (link, button, clickable card).
 * Static panels use SERVICE_PANEL / SERVICE_PANEL_SOFT alone — a hover state on a
 * non-clickable box promises an action that isn't there.
 */
export const SERVICE_CARD_INTERACTIVE =
  'transition-colors duration-150 ease-out hover:border-basic-4 focus-ring';
