/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://okdohyuk.dev',
  changefreq: 'daily',
  generateRobotsTxt: true,
  exclude: ['/server-sitemap-index.xml'],
  robotsTxtOptions: {
    additionalSitemaps: ['https://okdohyuk.dev/server-sitemap-index.xml'],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
