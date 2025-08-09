type CoderType = 'BASE64' | 'URI' | 'URI_COMPONENT' | 'ESCAPE' | 'HEX' | 'BINARY' | 'HTML';

type CoderFormType = {
  type: CoderType;
  count: number;
  isEncoder: boolean;
  value: string;
};

export type { CoderType, CoderFormType };
