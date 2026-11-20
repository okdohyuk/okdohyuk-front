import './prismManual';
import Prism from 'prismjs';
// Grammars are side-effect modules that extend the global Prism. Order matters: each one
// must come after the grammars it extends (e.g. jsx → markup + javascript, cpp → c → clike).
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-groovy';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-diff';
import 'prismjs/components/prism-ini';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-makefile';
import 'prismjs/components/prism-properties';

/** Language id for code rendered as escaped text without tokens. */
export const PLAIN_LANGUAGE = 'plain';

const LANGUAGE_ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  console: 'bash',
  ts: 'typescript',
  js: 'javascript',
  yml: 'yaml',
  py: 'python',
  rb: 'ruby',
  kt: 'kotlin',
  dockerfile: 'docker',
  md: 'markdown',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  text: PLAIN_LANGUAGE,
  plaintext: PLAIN_LANGUAGE,
  txt: PLAIN_LANGUAGE,
  none: PLAIN_LANGUAGE,
};

// Labels shown in the code block header. Prism's `markup` id means nothing to a reader,
// so aliases that point at it keep the name the author wrote.
const LABEL_OVERRIDES: Record<string, string> = { markup: 'html' };

const SHELL_PROMPT = /^\s*\$ /;

/** A fence with no language is treated as bash only when every non-empty line is a `$ ` prompt. */
export function looksLikeShellSession(code: string): boolean {
  const lines = code.split('\n').filter((line) => line.trim() !== '');
  return lines.length > 0 && lines.every((line) => SHELL_PROMPT.test(line));
}

/** Pulls the fence language from markdown-to-jsx's `lang-xxx` (or `language-xxx`) class. */
export function languageFromClassName(className?: string): string | undefined {
  const match = className?.match(/(?:^|\s)lang(?:uage)?-([\w+#.-]+)/);
  return match?.[1];
}

// Prism.languages also holds helpers (extend, insertBefore, …) and inherits Object.prototype,
// so a fence named `extend` or `toString` must not be mistaken for a grammar.
function getGrammar(language: string): Prism.Grammar | undefined {
  if (!Object.prototype.hasOwnProperty.call(Prism.languages, language)) return undefined;
  const grammar = Prism.languages[language];
  return grammar && typeof grammar === 'object' ? grammar : undefined;
}

/** Resolves a fence language to a loaded Prism grammar id, or `plain`. */
export function resolveLanguage(rawLanguage: string | undefined, code = ''): string {
  const normalized = rawLanguage?.trim().toLowerCase();
  if (!normalized) return looksLikeShellSession(code) ? 'bash' : PLAIN_LANGUAGE;

  const language = LANGUAGE_ALIASES[normalized] ?? normalized;
  if (language === PLAIN_LANGUAGE) return PLAIN_LANGUAGE;
  return getGrammar(language) ? language : PLAIN_LANGUAGE;
}

/** Header label: what the author wrote, normalized; empty for plain text. */
export function languageLabel(rawLanguage: string | undefined, resolved: string): string {
  if (resolved === PLAIN_LANGUAGE) return '';
  const normalized = rawLanguage?.trim().toLowerCase();
  if (!normalized) return resolved;
  return LABEL_OVERRIDES[normalized] ?? normalized;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

export type HighlightResult = {
  /** Safe HTML: Prism tokens, or escaped text for plain. */
  html: string;
  /** Resolved Prism language id or `plain`. */
  language: string;
  /** Header label; empty when the block is plain text. */
  label: string;
};

/**
 * Highlights a code block at render time. Pure string → string, so it runs during SSR and
 * the first paint is already coloured (no highlightAll, no DOM mutation after hydration).
 */
export function highlightCode(code: string, rawLanguage?: string): HighlightResult {
  const language = resolveLanguage(rawLanguage, code);
  const label = languageLabel(rawLanguage, language);
  const grammar = language === PLAIN_LANGUAGE ? undefined : getGrammar(language);

  if (!grammar) return { html: escapeHtml(code), language: PLAIN_LANGUAGE, label: '' };

  try {
    return { html: Prism.highlight(code, grammar, language), language, label };
  } catch {
    // A grammar bug must never take the post down; fall back to plain text.
    return { html: escapeHtml(code), language: PLAIN_LANGUAGE, label: '' };
  }
}
