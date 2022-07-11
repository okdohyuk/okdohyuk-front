/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://okdohyuk.dev',
  changefreq: 'daily',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
