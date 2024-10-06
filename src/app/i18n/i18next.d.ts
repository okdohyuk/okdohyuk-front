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
import todo from 'assets/locales/ko/todo.json';
import blog from 'assets/locales/ko/blog/index.json';
import blogw from 'assets/locales/ko/blog/write.json';
import type from 'assets/locales/ko/type.json';

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
      'blog/index': typeof blog;
      'blog/write': typeof blogw;
    };
  }
}
