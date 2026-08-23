#!/usr/bin/env node
/**
 * buildTemplateHtml.mjs — pptasset deck.html에서 대표 슬라이드만 추려
 * public/ppt/template.html (self-contained 단일 HTML)을 조립한다.
 *
 * 사용: node scripts/buildTemplateHtml.mjs
 * 원본: /Users/okdohyuk/Documents/pptasset (deck.html, deck.css, deck-stage.js, assets/colors_and_type.css)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FRONT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PPTASSET = '/Users/okdohyuk/Documents/pptasset';

const OUT_PATH = join(FRONT_ROOT, 'public/ppt/template.html');

// 레이아웃 패밀리별 대표 슬라이드 (data-label 접두 번호)
const REPRESENTATIVE_LABELS = [
  '01', // cover
  '02', // agenda
  '03', // glossary
  '05', // stat
  '06', // concept
  '07', // columns
  '09', // list
  '10', // cards
  '12', // table
  '18', // roadmap
  '24', // chart
  '41', // media
  '53', // timeline
  '54', // swot
  '59', // closing
];

const deck = readFileSync(join(PPTASSET, 'deck.html'), 'utf8');
const deckCss = readFileSync(join(PPTASSET, 'deck.css'), 'utf8');
const colorsCss = readFileSync(join(PPTASSET, 'assets/colors_and_type.css'), 'utf8');
const stageJs = readFileSync(join(PPTASSET, 'deck-stage.js'), 'utf8');

// section.slide 블록 추출
const slideBlocks = new Map();
const sectionRe = /^[ \t]*<section class="slide[^>]*data-label="(\d\d)[^"]*">$/gm;
let match;
while ((match = sectionRe.exec(deck)) !== null) {
  const startLine = deck.slice(0, match.index).split('\n').length;
  const from = deck.indexOf(match[0].trim(), deck.indexOf('<section', deck.slice(0, match.index).length));
  const openIdx = deck.indexOf('<section class="slide', deck.slice(0, match.index).length);
  const closeIdx = deck.indexOf('</section>', openIdx);
  const block = deck.slice(openIdx, closeIdx + '</section>'.length);
  slideBlocks.set(match[1], block);
}

const selectedSlides = REPRESENTATIVE_LABELS.map((label, i) => {
  const block = slideBlocks.get(label);
  if (!block) throw new Error(`slide ${label} not found in deck.html`);
  return `  <!-- ${String(i + 1).padStart(2, '0')} -->\n${block}`;
});

// speaker notes: 선택된 슬라이드의 원본 노트를 순서대로 재수집
const notesMatch = deck.match(
  /<script type="application\/json" id="speaker-notes">\s*(\[[\s\S]*?\])\s*<\/script>/,
);
if (!notesMatch) throw new Error('speaker-notes script not found');
const originalNotes = JSON.parse(notesMatch[1]);
const labelToNoteIndex = [];
{
  const allLabels = [...deck.matchAll(/data-label="(\d\d)/g)].map((m) => m[1]);
  for (const label of REPRESENTATIVE_LABELS) {
    labelToNoteIndex.push(allLabels.indexOf(label));
  }
}
const notes = labelToNoteIndex.map((idx) => originalNotes[idx] ?? '');

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>okdohyuk 웹 프레젠테이션 템플릿</title>
<meta name="viewport" content="width=1920, initial-scale=1" />
<style>
${colorsCss}
</style>
<style>
${deckCss}
</style>
<script type="application/json" id="speaker-notes">
${JSON.stringify(notes, null, 2)}
</script>
</head>
<body>
<deck-stage width="1920" height="1080">

${selectedSlides.join('\n\n')}

</deck-stage>
<script>
${stageJs}
</script>
</body>
</html>
`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, html);
console.log(`wrote ${OUT_PATH} (${(html.length / 1024).toFixed(1)}K, ${selectedSlides.length} slides)`);
