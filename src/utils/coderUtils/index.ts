import { CoderFormType } from './type';

export default class CoderUtils {
  static runCoder = ({ type, count, isEncoder, value }: CoderFormType): string[] => {
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

    if (coderFunc === null) {
      throw new Error(`지원하지 않는 타입입니다: ${type}`);
    }

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
