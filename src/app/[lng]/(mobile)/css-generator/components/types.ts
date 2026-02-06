export type GeneratorTab = 'shadow' | 'gradient' | 'radius' | 'flex' | 'grid';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap';
export type FlexJustify =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type FlexAlign = 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';

export type GridAlign = 'stretch' | 'start' | 'center' | 'end';

export interface ShadowState {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export interface GradientState {
  direction: string;
  from: string;
  to: string;
}

export interface RadiusState {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

export interface FlexState {
  direction: FlexDirection;
  wrap: FlexWrap;
  justifyContent: FlexJustify;
  alignItems: FlexAlign;
  gap: number;
}

export interface GridState {
  columns: number;
  rows: number;
  justifyItems: GridAlign;
  alignItems: GridAlign;
  gap: number;
}
