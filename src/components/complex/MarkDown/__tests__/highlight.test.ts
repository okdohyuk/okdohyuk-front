import { describe, expect, it } from 'vitest';
import {
  PLAIN_LANGUAGE,
  highlightCode,
  languageFromClassName,
  looksLikeShellSession,
  resolveLanguage,
} from '../highlight';

describe('resolveLanguage', () => {
  it.each([
    ['swift', 'swift'],
    ['python', 'python'],
    ['py', 'python'],
    ['sh', 'bash'],
    ['shell', 'bash'],
    ['zsh', 'bash'],
    ['console', 'bash'],
    ['ts', 'typescript'],
    ['js', 'javascript'],
    ['yml', 'yaml'],
    ['rb', 'ruby'],
    ['kt', 'kotlin'],
    ['Dockerfile', 'docker'],
    ['md', 'markdown'],
    ['html', 'markup'],
    ['xml', 'markup'],
    ['groovy', 'groovy'],
    ['c', 'c'],
    ['cpp', 'cpp'],
    ['diff', 'diff'],
    ['toml', 'toml'],
  ])('%s → %s', (raw, expected) => {
    expect(resolveLanguage(raw)).toBe(expected);
  });

  it.each(['text', 'plaintext', 'txt', 'none'])('%s → plain', (raw) => {
    expect(resolveLanguage(raw)).toBe(PLAIN_LANGUAGE);
  });

  it('falls back to plain for unknown languages and Prism helper names', () => {
    expect(resolveLanguage('brainfuck-ish')).toBe(PLAIN_LANGUAGE);
    expect(resolveLanguage('extend')).toBe(PLAIN_LANGUAGE);
    expect(resolveLanguage('toString')).toBe(PLAIN_LANGUAGE);
  });

  it('treats a fence without language as bash only when every line is a $ prompt', () => {
    expect(resolveLanguage(undefined, '$ ls -al\n\n$ cd ~')).toBe('bash');
    expect(resolveLanguage(undefined, '$ du -sh .\n284G .')).toBe(PLAIN_LANGUAGE);
    expect(resolveLanguage(undefined, 'hello')).toBe(PLAIN_LANGUAGE);
    expect(resolveLanguage(undefined, '')).toBe(PLAIN_LANGUAGE);
  });
});

describe('looksLikeShellSession', () => {
  it('requires a "$ " prefix, not just a dollar sign', () => {
    expect(looksLikeShellSession('$HOME/bin')).toBe(false);
    expect(looksLikeShellSession('  $ echo hi')).toBe(true);
  });
});

describe('languageFromClassName', () => {
  it('reads markdown-to-jsx lang- and language- classes', () => {
    expect(languageFromClassName('lang-swift')).toBe('swift');
    expect(languageFromClassName('language-c++')).toBe('c++');
    expect(languageFromClassName(undefined)).toBeUndefined();
    expect(languageFromClassName('foo')).toBeUndefined();
  });
});

describe('highlightCode', () => {
  it('tokenizes swift', () => {
    const result = highlightCode('let x = "hi"\nfunc run() {}', 'swift');
    expect(result.language).toBe('swift');
    expect(result.label).toBe('swift');
    expect(result.html).toContain('<span class="token keyword">let</span>');
    expect(result.html).toContain('<span class="token string-literal');
  });

  it('tokenizes python', () => {
    const result = highlightCode('def f():\n    return 1  # one', 'python');
    expect(result.html).toContain('<span class="token keyword">def</span>');
    expect(result.html).toContain('<span class="token comment"># one</span>');
  });

  it('highlights a bash alias and keeps the authored label', () => {
    const result = highlightCode('echo "$HOME"', 'sh');
    expect(result.language).toBe('bash');
    expect(result.label).toBe('sh');
    expect(result.html).toContain('token');
  });

  it('labels markup aliases with the authored name, not "markup"', () => {
    expect(highlightCode('<p></p>', 'html').label).toBe('html');
    expect(highlightCode('<p></p>', 'xml').label).toBe('xml');
  });

  it('renders unknown languages as escaped plain text without a label', () => {
    const result = highlightCode('a < b && c', 'nope');
    expect(result).toEqual({ html: 'a &lt; b &amp;&amp; c', language: PLAIN_LANGUAGE, label: '' });
  });

  it('escapes <script> in plain text', () => {
    const result = highlightCode('<script>alert("x")</script>', 'text');
    expect(result.html).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(result.html).not.toContain('<script');
  });

  it('escapes markup inside highlighted code', () => {
    const result = highlightCode('const s = "<img onerror=x>";', 'ts');
    expect(result.html).not.toContain('<img');
    expect(result.html).toContain('&lt;img');
  });

  it('labels a $-prompt fence without language as bash', () => {
    const result = highlightCode('$ xcrun simctl list', undefined);
    expect(result.language).toBe('bash');
    expect(result.label).toBe('bash');
  });
});
