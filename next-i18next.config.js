module.exports = {
  debug: process.env.NODE_ENV === 'development',
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
