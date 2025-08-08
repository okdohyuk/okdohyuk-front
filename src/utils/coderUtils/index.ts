import { CoderFormType } from './type';

export default class CoderUtils {
  static runCoder = ({ type, count, isEncoder, value }: CoderFormType): string[] => {
    const result: string[] = [];

    const base64 = {
      enc: (data: string) => btoa(data),
      dec: (data: string) => atob(data),
    };

    const uri = {
      enc: (data: string) => encodeURI(data),
      dec: (data: string) => decodeURI(data),
    };

    const uriComponent = {
      enc: (data: string) => encodeURIComponent(data),
      dec: (data: string) => decodeURIComponent(data),
    };

    const escapeCoder = {
      enc: (data: string) => escape(data),
      dec: (data: string) => unescape(data),
    };

    const hex = {
      enc: (data: string) =>
        Array.from(data)
          .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join(''),
      dec: (data: string) =>
        (data.match(/.{1,2}/g) || [])
          .map((byte) => String.fromCharCode(parseInt(byte, 16)))
          .join(''),
    };

    const binary = {
      enc: (data: string) =>
        Array.from(data)
          .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
          .join(' '),
      dec: (data: string) =>
        data
          .split(' ')
          .filter((b) => b)
          .map((b) => String.fromCharCode(parseInt(b, 2)))
          .join(''),
    };

    const html = {
      enc: (data: string) =>
        data
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;'),
      dec: (data: string) =>
        data
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&'),
    };

    const coderMap = {
      BASE64: base64,
      URI: uri,
      URI_COMPONENT: uriComponent,
      ESCAPE: escapeCoder,
      HEX: hex,
      BINARY: binary,
      HTML: html,
    } as const;

    const coder = coderMap[type];
    if (!coder) {
      throw new Error(`지원하지 않는 타입입니다: ${type}`);
    }

    const coderFunc = isEncoder ? coder.enc : coder.dec;

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        result.push(coderFunc(value));
      } else {
        result.push(coderFunc(result[i - 1]));
      }
    }

    return result;
  };
}
