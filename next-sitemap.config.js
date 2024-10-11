/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: 'https://okdohyuk.dev',
  changefreq: 'daily',
  generateRobotsTxt: true,
  exclude: ['/server-sitemap.xml'],
  robotsTxtOptions: {
    additionalSitemaps: ['https://okdohyuk.dev/server-sitemap.xml'],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
