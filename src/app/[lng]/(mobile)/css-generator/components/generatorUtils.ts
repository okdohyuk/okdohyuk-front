import { GradientState, ShadowState } from './types';

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
