export type GeneratorTab = 'shadow' | 'gradient';

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
