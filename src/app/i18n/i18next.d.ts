// import the original type declarations
import 'i18next';
// import all namespaces (for the default language, only)
import index from 'assets/locales/ko/index.json';
import notFound from 'assets/locales/ko/notFound.json';
import coder from 'assets/locales/ko/coder.json';
import common from 'assets/locales/ko/common.json';
import login from 'assets/locales/ko/login.json';
import dreamResolver from 'assets/locales/ko/dream-resolver.json';
import menu from 'assets/locales/ko/menu.json';
import percent from 'assets/locales/ko/percent.json';
import multiLive from '@assets/locales/ko/multi-live.json';
import todo from 'assets/locales/ko/todo.json';
import blog from 'assets/locales/ko/blog/index.json';
import blogw from 'assets/locales/ko/blog/write.json';
import type from 'assets/locales/ko/type.json';
import ppollong from 'assets/locales/ko/ppollong.json'; // ppollong.json 임포트 추가
import serverClock from 'assets/locales/ko/server-clock.json';
import choseongMaker from 'assets/locales/ko/choseong-maker.json';
import qrGenerator from 'assets/locales/ko/qr-generator.json';
import jwtDecoder from 'assets/locales/ko/jwt-decoder.json';
import cronGenerator from 'assets/locales/ko/cron-generator.json';
import cssGenerator from 'assets/locales/ko/css-generator.json';
import slugGenerator from 'assets/locales/ko/slug-generator.json';
import urlParser from 'assets/locales/ko/url-parser.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    defaultNS: 'type';
    // custom resources type
    resources: {
      type: typeof type;
      index: typeof index;
      notFound: typeof notFound;
      coder: typeof coder;
      common: typeof common;
      login: typeof login;
      'dream-resolver': typeof dreamResolver;
      menu: typeof menu & { [key: string]: string };
      percent: typeof percent;
      todo: typeof todo;
      'multi-live': typeof multiLive;
      'blog/index': typeof blog;
      'blog/write': typeof blogw;
      ppollong: typeof ppollong; // ppollong 네임스페이스 추가
      'server-clock': typeof serverClock;
      'choseong-maker': typeof choseongMaker;
      'qr-generator': typeof qrGenerator;
      'jwt-decoder': typeof jwtDecoder;
      'cron-generator': typeof cronGenerator;
      'css-generator': typeof cssGenerator;
      'slug-generator': typeof slugGenerator;
      'url-parser': typeof urlParser;
    };
  }
}
