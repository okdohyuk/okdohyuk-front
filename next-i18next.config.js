const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'ja', 'zh'],
  },
  localePath: path.resolve('./src/assets/locales'),
};
