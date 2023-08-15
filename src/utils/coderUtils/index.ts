import { CoderType } from './type';

type RunActionType = {
  type: CoderType;
  count: number;
  isEncoder: boolean;
  value: string;
};

export default class CoderUtils {
  static runAction = ({ type, count, isEncoder, value }: RunActionType): string[] => {
    let coderFunc: ((data: string) => string) | null = null;
    const result: string[] = [];

    switch (type) {
      case 'BASE64':
        isEncoder ? (coderFunc = btoa) : (coderFunc = atob);
        break;
      case 'URI':
        isEncoder ? (coderFunc = encodeURI) : (coderFunc = decodeURI);
        break;
    }

    if (coderFunc === null) return [];

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        result.push(coderFunc(value));
        continue;
      }
      result.push(coderFunc(result[i - 1]));
    }

    return result;
  };
}
