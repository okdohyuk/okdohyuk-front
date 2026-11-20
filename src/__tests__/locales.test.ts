import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Locale lint — keeps the 4 languages in step and the copy rules from the unslop pass:
 *  - every namespace has the same key set in ko/en/ja/zh
 *  - no `!` in UI copy
 *  - labels/titles/buttons/placeholders carry no trailing period (body copy does)
 */

const LOCALES_DIR = path.resolve(__dirname, '../assets/locales');
const LANGUAGES = ['ko', 'en', 'ja', 'zh'] as const;
/** i18next typing stub (defaultNS), ko only and empty by design. */
const TYPE_ONLY_NAMESPACES = new Set(['type.json']);
/** Leaf key names that hold short labels rather than sentences. */
const LABEL_KEY = /(title|label|button|placeholder)$/i;
/** `subTitle` / `subtitle` is a sentence under a heading, i.e. body copy. */
const BODY_KEY_EXCEPTION = /^sub[Tt]itle$/;
const TRAILING_PERIOD = /[.。．]$/;
/** `...` / `…` is an ellipsis, not a period. */
const TRAILING_ELLIPSIS = /(\.\.\.|…)$/;
/** Allow `!` only inside URLs or code-ish tokens (none today, kept for future copy). */
const URL_OR_CODE = /https?:\/\/\S+|`[^`]*`/g;

type FlatLocale = Record<string, string>;

const listNamespaces = (dir: string, base = dir): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listNamespaces(full, base);
    return entry.name.endsWith('.json') ? [path.relative(base, full)] : [];
  });

/**
 * Flattens to dotted keys. With `arraysAsLeaf`, an array counts as one key (keyword lists may
 * differ in length per language); otherwise each string element is its own entry.
 */
const flatten = (value: unknown, arraysAsLeaf: boolean, prefix = ''): FlatLocale => {
  if (typeof value === 'string') return { [prefix]: value };
  if (arraysAsLeaf && Array.isArray(value)) return { [prefix]: value.join(' ') };
  if (!value || typeof value !== 'object') return {};
  return Object.entries(value).reduce<FlatLocale>(
    (acc, [key, child]) => ({
      ...acc,
      ...flatten(child, arraysAsLeaf, prefix ? `${prefix}.${key}` : key),
    }),
    {},
  );
};

const readLocale = (lng: string, ns: string, arraysAsLeaf: boolean): FlatLocale | null => {
  const file = path.join(LOCALES_DIR, lng, ns);
  if (!fs.existsSync(file)) return null;
  return flatten(JSON.parse(fs.readFileSync(file, 'utf8')), arraysAsLeaf);
};

const namespaces = [
  ...new Set(LANGUAGES.flatMap((lng) => listNamespaces(path.join(LOCALES_DIR, lng)))),
]
  .filter((ns) => !TYPE_ONLY_NAMESPACES.has(ns))
  .sort();

const leafKey = (key: string) =>
  key
    .split('.')
    .filter((segment) => !/^\d+$/.test(segment))
    .pop() ?? '';

describe('locales', () => {
  it('finds namespaces to check', () => {
    expect(namespaces.length).toBeGreaterThan(0);
  });

  describe.each(namespaces)('%s', (ns) => {
    const keysByLanguage = Object.fromEntries(
      LANGUAGES.map((lng) => [lng, readLocale(lng, ns, true)]),
    );
    const byLanguage = Object.fromEntries(
      LANGUAGES.map((lng) => [lng, readLocale(lng, ns, false)]),
    );

    it('exists with an identical key set in every language', () => {
      const reference = Object.keys(keysByLanguage.ko ?? {}).sort();
      LANGUAGES.forEach((lng) => {
        expect(keysByLanguage[lng], `${lng}/${ns} is missing`).not.toBeNull();
        expect(Object.keys(keysByLanguage[lng] ?? {}).sort(), `${lng}/${ns} keys`).toEqual(
          reference,
        );
      });
    });

    it('has no exclamation marks', () => {
      const offenders = LANGUAGES.flatMap((lng) =>
        Object.entries(byLanguage[lng] ?? {})
          .filter(([, value]) => /[!！]/.test(value.replace(URL_OR_CODE, '')))
          .map(([key, value]) => `${lng}:${key} = ${value}`),
      );
      expect(offenders).toEqual([]);
    });

    it('has no trailing period on title/label/button/placeholder keys', () => {
      const offenders = LANGUAGES.flatMap((lng) =>
        Object.entries(byLanguage[lng] ?? {})
          .filter(([key, value]) => {
            const leaf = leafKey(key);
            if (BODY_KEY_EXCEPTION.test(leaf) || !LABEL_KEY.test(leaf)) return false;
            return TRAILING_PERIOD.test(value) && !TRAILING_ELLIPSIS.test(value);
          })
          .map(([key, value]) => `${lng}:${key} = ${value}`),
      );
      expect(offenders).toEqual([]);
    });
  });
});
