import { FlexState, GradientState, GridState, RadiusState, ShadowState } from './types';

const hexToRgba = (hex: string, alpha: number) => {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const buildShadowCss = (shadow: ShadowState) =>
  `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${hexToRgba(
    shadow.color,
    shadow.opacity,
  )}`;

export const buildShadowTailwind = (shadow: ShadowState) =>
  `shadow-[${shadow.x}px_${shadow.y}px_${shadow.blur}px_${shadow.spread}px_${hexToRgba(
    shadow.color,
    shadow.opacity,
  ).replace(/ /g, '')}]`;

export const buildGradientCss = (gradient: GradientState) =>
  `linear-gradient(${gradient.direction}, ${gradient.from}, ${gradient.to})`;

export const buildGradientTailwind = (gradient: GradientState) =>
  `bg-[linear-gradient(${gradient.direction.replace(' ', '_')},${gradient.from},${gradient.to})]`;

export const buildRadiusCss = (radius: RadiusState) =>
  `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;

export const buildRadiusTailwind = (radius: RadiusState) =>
  `rounded-[${radius.topLeft}px_${radius.topRight}px_${radius.bottomRight}px_${radius.bottomLeft}px]`;

const FLEX_DIRECTION_CLASS_MAP: Record<FlexState['direction'], string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const FLEX_WRAP_CLASS_MAP: Record<FlexState['wrap'], string> = {
  nowrap: 'flex-nowrap',
  wrap: 'flex-wrap',
};

const FLEX_JUSTIFY_CLASS_MAP: Record<FlexState['justifyContent'], string> = {
  'flex-start': 'justify-start',
  center: 'justify-center',
  'flex-end': 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
};

const FLEX_ALIGN_CLASS_MAP: Record<FlexState['alignItems'], string> = {
  stretch: 'items-stretch',
  'flex-start': 'items-start',
  center: 'items-center',
  'flex-end': 'items-end',
  baseline: 'items-baseline',
};

const GRID_ALIGN_CLASS_MAP: Record<GridState['justifyItems'], string> = {
  stretch: 'stretch',
  start: 'start',
  center: 'center',
  end: 'end',
};

export const buildFlexCss = (flex: FlexState) =>
  `display: flex; flex-direction: ${flex.direction}; flex-wrap: ${flex.wrap}; justify-content: ${flex.justifyContent}; align-items: ${flex.alignItems}; gap: ${flex.gap}px;`;

export const buildFlexTailwind = (flex: FlexState) =>
  `flex ${FLEX_DIRECTION_CLASS_MAP[flex.direction]} ${FLEX_WRAP_CLASS_MAP[flex.wrap]} ${
    FLEX_JUSTIFY_CLASS_MAP[flex.justifyContent]
  } ${FLEX_ALIGN_CLASS_MAP[flex.alignItems]} gap-[${flex.gap}px]`;

export const buildGridCss = (grid: GridState) =>
  `display: grid; grid-template-columns: repeat(${grid.columns}, minmax(0, 1fr)); grid-template-rows: repeat(${grid.rows}, minmax(0, 1fr)); justify-items: ${grid.justifyItems}; align-items: ${grid.alignItems}; gap: ${grid.gap}px;`;

export const buildGridTailwind = (grid: GridState) =>
  `grid grid-cols-${grid.columns} grid-rows-${grid.rows} justify-items-${
    GRID_ALIGN_CLASS_MAP[grid.justifyItems]
  } items-${GRID_ALIGN_CLASS_MAP[grid.alignItems]} gap-[${grid.gap}px]`;
