/** @description 빌드 후 사이트맵 기반으로 Command Palette 페이지 데이터를 생성합니다. */

const { globSync } = require('glob');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const localesDir = path.join(projectRoot, 'src', 'assets', 'locales');
const languages = ['ko', 'en', 'ja', 'zh'];

function getTitle(ns, lng) {
  // 네임스페이스 경로에서 locale 파일 찾기
  const candidates = [
    path.join(localesDir, lng, `${ns}.json`),
    path.join(localesDir, lng, `${ns}/index.json`),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // openGraph.title 또는 title 키 시도
      return data.openGraph?.title || data.openGraph?.defaultTitle || data.title || null;
    } catch {
      // 파싱 실패 시 무시
    }
  }
  return null;
}

function pathToNamespace(pagePath) {
  const cleaned = pagePath.replace(/^\//, '');
  if (!cleaned) return 'index';
  return cleaned;
}

function run() {
  const pageFiles = globSync('src/app/**/page.{js,jsx,ts,tsx}', {
    cwd: projectRoot,
    ignore: [
      'src/app/api/**',
      'src/app/**/_*/**',
      'src/app/**/@*/**',
      'src/app/**/[...notFound]/page.*',
      'src/app/**/[...notFound]/**/page.*',
    ],
  });

  const pages = [];

  pageFiles.forEach((file) => {
    let routePath = file
      .replace(/^src\/app/, '')
      .replace(/page\.(js|jsx|ts|tsx)$/, '')
      .replace(/\/$/, '');

    // 라우트 그룹 제거 (mobile), (search) 등
    routePath = routePath
      .split('/')
      .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
      .join('/');

    if (routePath === '') routePath = '/';

    // 선택적 catch-all 제거
    routePath = routePath.replace(/\/\[\[\.\.\..*?\]\]$/, '');
    if (routePath === '') routePath = '/';

    // catch-all 라우트 제외
    if (routePath.includes('[...')) return;

    // [lng] 라우트만 처리
    if (!routePath.includes('[lng]')) return;

    // [lng] 제거
    let pagePath = routePath.replace('/[lng]', '') || '/';

    // 나머지 동적 세그먼트가 있으면 제외
    if (pagePath.includes('[')) return;

    // 권한 레벨 결정 (미들웨어 텍스트 기반)
    const isAdmin = pagePath.startsWith('/admin');
    const access = isAdmin ? 'admin' : 'public';

    // 로케일 파일에서 타이틀 가져오기
    const ns = pathToNamespace(pagePath);
    const titles = {};
    let foundTitle = false;

    languages.forEach((lng) => {
      const title = getTitle(ns, lng);
      if (title) {
        titles[lng] = title;
        foundTitle = true;
      }
    });

    pages.push({
      path: pagePath,
      access,
      ...(foundTitle ? { titles } : {}),
    });
  });

  // 중복 제거
  const uniquePages = pages.filter(
    (page, index, self) => index === self.findIndex((p) => p.path === page.path),
  );

  // 경로 기준 정렬
  uniquePages.sort((a, b) => a.path.localeCompare(b.path));

  const output = {
    pages: uniquePages,
    generatedAt: new Date().toISOString(),
  };

  const outputPath = path.join(projectRoot, 'public', 'command-palette-pages.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`[Command Palette] Generated ${uniquePages.length} pages → ${outputPath}`);
}

run();
