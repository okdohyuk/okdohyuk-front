type CoderType = 'BASE64' | 'URI';

type CoderFormType = {
  type: CoderType;
  count: number;
  isEncoder: boolean;
  value: string;
};

export type { CoderType, CoderFormType };
