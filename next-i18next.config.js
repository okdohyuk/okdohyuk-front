module.exports = {
  debug: false,
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
