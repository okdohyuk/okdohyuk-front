/** @type {import('next-sitemap').IConfig} */

const siteUrl = 'https://okdohyuk.dev';
const { globSync } = require('glob'); // glob 라이브러리 추가

module.exports = {
  siteUrl: siteUrl,
  changefreq: 'daily',
  generateRobotsTxt: true,
  priority: 0.7, // 기본 우선순위 추가
  exclude: ['/server-sitemap.xml'],
  robotsTxtOptions: {
    additionalSitemaps: [`${siteUrl}/server-sitemap.xml`],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/admin', '/admin/*'], // /admin 및 그 하위 경로 모두 차단
      },
    ],
  },
  // WangHoHan 사용자의 해결 방법을 적용한 additionalPaths 함수
  additionalPaths: async (config) => {
    const pageFiles = globSync('src/app/**/page.{js,jsx,ts,tsx}', {
      cwd: __dirname,
      ignore: [
        'src/app/api/**', // API 경로는 제외
        'src/app/**/_*/**', // 비공개 폴더 (예: _components, _layout 등) 내부의 페이지 제외
        'src/app/**/@*/**', // 병렬 라우트 (예: @modal, @drawer) 제외
        'src/app/**/[...notFound]/page.{js,jsx,ts,tsx}', // [...notFound].tsx 페이지 제외
        'src/app/**/[...notFound]/**/page.{js,jsx,ts,tsx}', // 중첩된 [...notFound] 페이지 제외
        'src/app/**/admin/**', // admin 관련 모든 경로 제외
      ],
    });

    const sitemapEntries = [];
    const locales = ['ko', 'en'];

    pageFiles.forEach((file) => {
      let routePath = file
        .replace(/^src\/app/, '')
        .replace(/page\.(js|jsx|ts|tsx)$/, '')
        .replace(/\/$/, '');

      routePath = routePath
        .split('/')
        .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
        .join('/');

      if (routePath === '') routePath = '/';

      routePath = routePath.replace(/\/\[\[\.\.\..*?\]\]$/, '');
      if (routePath === '') routePath = '/';

      // 1. [...notFound] 경로 명시적 제외
      if (routePath.includes('[...notFound]')) {
        return; // 이 파일에서 생성될 수 있는 모든 경로를 건너뜁니다.
      }

      if (routePath.includes('[lng]')) {
        locales.forEach((lng) => {
          let finalLoc = routePath.replace('[lng]', lng);

          // 2. [lng] 치환 후에도 다른 동적 세그먼트(예: [urlSlug])가 남아있으면 제외
          if (finalLoc.includes('[')) {
            return; // 이 특정 로케일 경로는 추가하지 않습니다.
          }

          if (finalLoc) {
            sitemapEntries.push({
              loc: finalLoc,
              changefreq: config.changefreq,
              priority: config.priority,
              lastmod: new Date().toISOString(),
            });
          }
        });
      } else if (!routePath.includes('[')) {
        // [lng]도 없고 다른 동적 세그먼트도 없는 정적 경로
        if (routePath) {
          sitemapEntries.push({
            loc: routePath,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: new Date().toISOString(),
          });
        }
      }
    });

    const uniqueEntries = sitemapEntries.filter(
      (entry, index, self) => index === self.findIndex((e) => e.loc === entry.loc),
    );
    return uniqueEntries;
  },
};
