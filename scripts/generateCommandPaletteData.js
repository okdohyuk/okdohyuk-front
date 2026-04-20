/** @description locale + build artifacts를 조합해 Command Palette / discovery 페이지 데이터를 생성합니다. */

const { globSync } = require('glob');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const localesDir = path.join(projectRoot, 'src', 'assets', 'locales');
const nextBuildDir = path.join(projectRoot, '.next');
const generatedDir = path.join(projectRoot, 'src', 'generated');
const publicDir = path.join(projectRoot, 'public');
const languages = ['ko', 'en', 'ja', 'zh'];
const localePrefixPattern = new RegExp(`^/(${languages.join('|')})(?=/|$)`);

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readLocaleNamespace(ns, lng) {
  const candidates = [
    path.join(localesDir, lng, `${ns}.json`),
    path.join(localesDir, lng, `${ns}/index.json`),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      // 파싱 실패 시 무시
    }
  }

  return null;
}

function getPageMetadata(ns, lng) {
  const data = readLocaleNamespace(ns, lng);
  if (!data) return null;

  const title = data.openGraph?.title || data.openGraph?.defaultTitle || data.title || null;
  const description = data.openGraph?.description || data.description || null;

  if (!title && !description) {
    return null;
  }

  return { title, description };
}

function pathToNamespace(pagePath) {
  const cleaned = pagePath.replace(/^\//, '');
  if (!cleaned) return 'index';
  return cleaned;
}

function stripLocalePrefix(routePath) {
  return routePath.replace(localePrefixPattern, '') || '/';
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getMetadataFromBuiltHtml(routePath) {
  const htmlPath = path.join(nextBuildDir, 'server', 'app', `${routePath}.html`);
  if (!fs.existsSync(htmlPath)) return null;

  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descriptionMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    );

    const title = titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1]).trim() : null;
    const description = descriptionMatch?.[1]
      ? decodeHtmlEntities(descriptionMatch[1]).trim()
      : null;

    if (!title && !description) return null;

    return { title, description };
  } catch {
    return null;
  }
}

function mergeLocalizedMaps(existingMap, nextMap) {
  const hasExisting = existingMap && Object.keys(existingMap).length > 0;
  const hasNext = nextMap && Object.keys(nextMap).length > 0;

  if (!hasExisting && !hasNext) return undefined;

  return {
    ...(existingMap || {}),
    ...(nextMap || {}),
  };
}

function mergePage(pagesByPath, page) {
  const existing = pagesByPath.get(page.path);

  if (!existing) {
    pagesByPath.set(page.path, page);
    return;
  }

  const mergedTitles = mergeLocalizedMaps(existing.titles, page.titles);
  const mergedDescriptions = mergeLocalizedMaps(existing.descriptions, page.descriptions);

  pagesByPath.set(page.path, {
    ...existing,
    ...page,
    ...(mergedTitles ? { titles: mergedTitles } : {}),
    ...(mergedDescriptions ? { descriptions: mergedDescriptions } : {}),
  });
}

function collectStaticAppPages(pagesByPath) {
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

    if (routePath.includes('[...')) return;
    if (!routePath.includes('[lng]')) return;

    const pagePath = routePath.replace('/[lng]', '') || '/';
    if (pagePath.includes('[')) return;

    const access = pagePath.startsWith('/admin') ? 'admin' : 'public';
    const ns = pathToNamespace(pagePath);
    const titles = {};
    const descriptions = {};

    languages.forEach((lng) => {
      const metadata = getPageMetadata(ns, lng);
      if (!metadata) return;
      if (metadata.title) titles[lng] = metadata.title;
      if (metadata.description) descriptions[lng] = metadata.description;
    });

    mergePage(pagesByPath, {
      path: pagePath,
      access,
      ...(Object.keys(titles).length > 0 ? { titles } : {}),
      ...(Object.keys(descriptions).length > 0 ? { descriptions } : {}),
    });
  });
}

function collectPrerenderedBlogPages(pagesByPath) {
  const prerenderManifestPath = path.join(nextBuildDir, 'prerender-manifest.json');
  if (!fs.existsSync(prerenderManifestPath)) return;

  try {
    const manifest = JSON.parse(fs.readFileSync(prerenderManifestPath, 'utf-8'));
    const routes = Object.entries(manifest.routes || {});

    routes.forEach(([routePath, routeMeta]) => {
      if (routeMeta?.srcRoute !== '/[lng]/blog/[urlSlug]') return;

      const localeMatch = routePath.match(/^\/(ko|en|ja|zh)(?=\/)/);
      if (!localeMatch) return;

      const lng = localeMatch[1];
      const pagePath = stripLocalePrefix(routePath);
      const metadata = getMetadataFromBuiltHtml(routePath);

      mergePage(pagesByPath, {
        path: pagePath,
        access: 'public',
        ...(metadata?.title ? { titles: { [lng]: metadata.title } } : {}),
        ...(metadata?.description ? { descriptions: { [lng]: metadata.description } } : {}),
      });
    });
  } catch {
    // prerender manifest 파싱 실패 시 블로그 상세 페이지 수집 생략
  }
}

function writeJsonFile(filePath, data) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function writeGeneratedModule(filePath, data) {
  ensureDirectory(path.dirname(filePath));
  const moduleSource = `export const commandPalettePages = ${JSON.stringify(
    data,
    null,
    2,
  )} as const;\n\nexport default commandPalettePages;\n`;
  fs.writeFileSync(filePath, moduleSource);
}

function run() {
  const pagesByPath = new Map();
  collectStaticAppPages(pagesByPath);
  collectPrerenderedBlogPages(pagesByPath);

  const uniquePages = Array.from(pagesByPath.values());
  uniquePages.sort((a, b) => a.path.localeCompare(b.path));

  const output = {
    pages: uniquePages,
    generatedAt: new Date().toISOString(),
  };

  const publicOutputPath = path.join(publicDir, 'command-palette-pages.json');
  const moduleOutputPath = path.join(generatedDir, 'commandPalettePages.ts');

  writeJsonFile(publicOutputPath, output);
  writeGeneratedModule(moduleOutputPath, output);

  console.log(
    `[Command Palette] Generated ${uniquePages.length} pages → ${publicOutputPath}, ${moduleOutputPath}`,
  );
}

run();
