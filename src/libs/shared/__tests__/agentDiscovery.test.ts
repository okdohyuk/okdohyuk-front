import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const projectRoot = path.resolve(__dirname, '../../../../');
const commandPalettePath = path.join(projectRoot, 'public', 'command-palette-pages.json');
const koIndexLocalePath = path.join(projectRoot, 'src/assets/locales/ko/index.json');
const enAgeCalculatorLocalePath = path.join(
  projectRoot,
  'src/assets/locales/en/age-calculator.json',
);
const koAgeCalculatorLocalePath = path.join(
  projectRoot,
  'src/assets/locales/ko/age-calculator.json',
);

let discoveryPagesModule: Awaited<typeof import('../discoveryPages')>;
let agentDiscoveryModule: Awaited<typeof import('../agentDiscovery')>;

type CommandPalettePage = {
  path: string;
  access: 'public' | 'admin';
  titles?: Record<string, string>;
  descriptions?: Record<string, string>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

describe('agent discovery metadata', () => {
  beforeAll(async () => {
    execFileSync('node', ['scripts/generateCommandPaletteData.js'], {
      cwd: projectRoot,
      stdio: 'pipe',
    });

    vi.resetModules();
    discoveryPagesModule = await import('../discoveryPages');
    agentDiscoveryModule = await import('../agentDiscovery');
  });

  it('command palette data is generated from locale titles and descriptions', () => {
    const commandPalette = readJson<{ pages: CommandPalettePage[] }>(commandPalettePath);
    const koIndexLocale = readJson<{ openGraph: { title: string; description: string } }>(
      koIndexLocalePath,
    );
    const koAgeCalculatorLocale = readJson<{
      openGraph: { title: string; description: string };
    }>(koAgeCalculatorLocalePath);

    const homePage = commandPalette.pages.find((page) => page.path === '/');
    const ageCalculatorPage = commandPalette.pages.find((page) => page.path === '/age-calculator');

    expect(homePage?.titles?.ko).toBe(koIndexLocale.openGraph.title);
    expect(homePage?.descriptions?.ko).toBe(koIndexLocale.openGraph.description);
    expect(ageCalculatorPage?.titles?.ko).toBe(koAgeCalculatorLocale.openGraph.title);
    expect(ageCalculatorPage?.descriptions?.ko).toBe(koAgeCalculatorLocale.openGraph.description);
  });

  it('discoveryPages returns localized metadata and can search by locale-derived descriptions', () => {
    const koAgeCalculatorLocale = readJson<{
      openGraph: { title: string; description: string };
    }>(koAgeCalculatorLocalePath);

    const page = discoveryPagesModule.getDiscoveryPage('/age-calculator');
    const matches = discoveryPagesModule.searchDiscoveryPages('생년월일', 'ko');

    expect(page).not.toBeNull();
    expect(discoveryPagesModule.getLocalizedPageTitle(page!, 'ko')).toBe(
      koAgeCalculatorLocale.openGraph.title,
    );
    expect(discoveryPagesModule.getLocalizedPageDescription(page!, 'ko')).toBe(
      koAgeCalculatorLocale.openGraph.description,
    );
    expect(matches.some((match) => match.path === '/age-calculator')).toBe(true);
  });

  it('homepage markdown uses locale-backed homepage and featured tool metadata', () => {
    const koIndexLocale = readJson<{ openGraph: { description: string } }>(koIndexLocalePath);
    const koAgeCalculatorLocale = readJson<{
      openGraph: { title: string; description: string };
    }>(koAgeCalculatorLocalePath);

    const markdown = agentDiscoveryModule.buildHomepageMarkdown('ko');

    expect(markdown).toContain(koIndexLocale.openGraph.description);
    expect(markdown).toContain(koAgeCalculatorLocale.openGraph.title);
    expect(markdown).toContain(koAgeCalculatorLocale.openGraph.description);
  });

  it('route markdown uses localized page title/description instead of slug text', () => {
    const enAgeCalculatorLocale = readJson<{
      openGraph: { title: string; description: string };
    }>(enAgeCalculatorLocalePath);

    const markdown = agentDiscoveryModule.buildRouteMarkdown('en', '/en/age-calculator');

    expect(markdown).toContain(`# ${enAgeCalculatorLocale.openGraph.title}`);
    expect(markdown).toContain(enAgeCalculatorLocale.openGraph.description);
    expect(markdown).not.toContain('# Age Calculator\n\n- Page URL');
  });
});
