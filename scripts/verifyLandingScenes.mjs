/* eslint-disable no-console, no-await-in-loop */

/**
 * 랜딩(/) 씬별 시각 검증 촬영기.
 *
 * 랜딩은 문서 높이가 2만 px 을 넘는 sticky 씬 연속이라 "프레임 200 응답 / JS 에러 0" 같은
 * 간접 지표로는 화면이 깨졌는지 알 수 없다. 이 스크립트는 **씬마다 대표 스크롤 위치를
 * 계산해 스크린샷을 남기고**, 함께 캔버스 bbox·현재 프레임 인덱스·엔진이 인식한 씬 번호를
 * 찍어 준다. 저장된 PNG 를 사람이 직접 열어 보는 것이 이 스크립트의 목적이다.
 *
 * ── 실행법 ────────────────────────────────────────────────────────────────
 *   yarn dev                                   # http://localhost:3000
 *   node scripts/verifyLandingScenes.mjs
 *
 *   환경 변수(선택)
 *     BASE_URL=http://localhost:3000
 *     LNG=ko                                   대상 로케일
 *     SCENES=hero,pokemon,clock,live,blend,closing,transition  촬영 대상 지정
 *       transition = 라이브 씬 후반 ~ 블렌딩 씬 진입까지의 **경계 구간 연속 촬영**
 *     ENGINE=chromium|webkit                   렌더 엔진 (기본 chromium)
 *     WIDTH=1440 HEIGHT=900                    뷰포트
 *     OUT=<절대경로>                            저장 루트(기본 _workspace/.../shots)
 *     REDUCED_MOTION=reduce                    동작 줄이기 — **스크럽은 그대로 돌고** 감속·카운트업
 *                                              같은 자동 모션만 꺼진 상태를 확인한다
 *     HEADED=1                                 브라우저 창 표시
 *     MOTION_SAMPLES=24                        씬당 캔버스 픽셀 해시 표본 수
 *     MOTION_MIN_UNIQUE=15                     표본 중 고유 이미지 최소 개수(합격선)
 *
 *   MODE=matrix                                **스크럽 활성 조건 매트릭스** (아래 runMatrix)
 *     ENGINES=chromium,webkit                  엔진 목록
 *     PROFILES=a-default,b-reduced,c-narrow,d-mobile,e-short
 *     MATRIX_SAMPLES=13 MATRIX_MIN_UNIQUE=10
 *
 * ── 왜 캔버스 픽셀 해시까지 보는가 ────────────────────────────────────────
 * `canvas.dataset.frame` 이 26→90 으로 잘 올라가도, 그 인덱스가 가리키는 **이미지가
 * 같으면** 화면은 정지한 것과 똑같다(실제로 그런 회귀가 있었다: 포켓몬 90장 중 고유 3장).
 * 그래서 씬을 훑으며 캔버스에 **그려진 픽셀**을 해시로 세어, 스크롤에 따라 그림이
 * 실제로 바뀌는지 정량 확인한다. 인접 표본 간 평균 픽셀 차이도 같이 내서
 * "부드럽게 이어지는가(급점프 없음)"를 본다.
 */

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LNG = process.env.LNG || 'ko';
const ENGINE_NAME = process.env.ENGINE || 'chromium';
const VIEWPORT = {
  width: Number(process.env.WIDTH || 1440),
  height: Number(process.env.HEIGHT || 900),
};
const HEADED = process.env.HEADED === '1';
const MOTION_SAMPLES = Number(process.env.MOTION_SAMPLES || 24);
const MOTION_MIN_UNIQUE = Number(process.env.MOTION_MIN_UNIQUE || 15);

/** 캔버스 픽셀 해시를 수집할 도구 씬(블렌딩·히어로는 시퀀스 씬이 아니다). */
const MOTION_SCENES = [
  { id: 'pokemon', index: 1 },
  { id: 'clock', index: 2 },
  { id: 'live', index: 3 },
];

const DEFAULT_OUT = path.resolve(
  REPO_ROOT,
  '..',
  '_workspace',
  '20260804_1155',
  'shots',
  ENGINE_NAME === 'chromium' ? '.' : ENGINE_NAME,
);
const OUT_ROOT = process.env.OUT ? path.resolve(process.env.OUT) : DEFAULT_OUT;

/**
 * 씬별 대표 스크롤 위치.
 * 씬 경계는 런타임(`[data-scene-index]` 섹션의 offsetTop/offsetHeight)에서 읽어 오고,
 * 여기서는 "씬 안에서 몇 % 지점을 찍을지"만 선언한다 → 씬 높이를 바꿔도 스크립트는 그대로다.
 */
const SCENE_SHOTS = [
  { id: 'hero', index: 0, ratios: [0.02, 0.35, 0.62, 0.88] },
  { id: 'pokemon', index: 1, ratios: [0.08, 0.35, 0.62, 0.9] },
  { id: 'clock', index: 2, ratios: [0.08, 0.35, 0.62, 0.9] },
  { id: 'live', index: 3, ratios: [0.08, 0.35, 0.62, 0.9] },
  { id: 'blend', index: 4, ratios: [0.06, 0.3, 0.5, 0.75] },
  { id: 'closing', index: 5, ratios: [0.06, 0.35, 0.7, 0.96] },
];

/**
 * 씬 경계(전환 구간) 정밀 촬영.
 *
 * 씬 대표 컷은 "각 씬 안"만 찍으므로 **씬과 씬 사이에서 화면이 비는 결함**을 못 잡는다.
 * sticky 씬은 마지막 1vh 에서 고정이 풀리며 다음 씬과 겹쳐 흐르는데, 그 구간을 촘촘히
 * 훑어야 공백·하드 엣지가 드러난다. `from`~`to` 를 `steps` 등분해 연속 촬영한다.
 */
const TRANSITION_SHOTS = [
  {
    // 히어로 → 첫 도구. 씬 겹침 처리는 모든 경계에서 같은 코드를 타므로 여기서도 확인한다.
    id: 'handoff',
    from: { index: 0, ratio: 0.86 },
    to: { index: 1, ratio: 0.3 },
    steps: 8,
  },
  {
    id: 'transition',
    from: { index: 3, ratio: 0.86 },
    to: { index: 4, ratio: 0.5 },
    steps: 10,
  },
  {
    // 블렌딩(도구 화면 → 도구 목록)이 실제로 교차하는 구간만 확대해서 본다.
    id: 'reveal',
    from: { index: 4, ratio: 0.3 },
    to: { index: 4, ratio: 0.66 },
    steps: 8,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 페이지에 붙는 광고/설문/개발 인디케이터는 판정 대상이 아니므로 가린다. */
const HIDE_NOISE_CSS = `
  ins.adsbygoogle, .adsbygoogle { display: none !important; }
  nextjs-portal { display: none !important; }
`;

async function measureScenes(page) {
  return page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('[data-scene-index]'));
    return {
      documentHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
      sections: sections.map((el) => ({
        index: Number(el.dataset.sceneIndex),
        top: el.offsetTop,
        height: el.offsetHeight,
      })),
    };
  });
}

async function readSceneState(page) {
  return page.evaluate(() => {
    const stage = document.querySelector('.landing-stage');
    const activeIndex = stage?.getAttribute('data-scene') ?? null;
    const section = activeIndex
      ? document.querySelector(`[data-scene-index="${activeIndex}"]`)
      : null;
    const canvas = section?.querySelector('canvas') ?? null;
    const rect = canvas?.getBoundingClientRect();
    const device = section?.querySelector('[data-scene-frame] figure') ?? null;
    const deviceRect = device?.getBoundingClientRect();
    const round = (n) => Math.round(n);

    return {
      activeIndex,
      frame: canvas?.dataset.frame ?? null,
      canvasBox: rect
        ? {
            x: round(rect.x),
            y: round(rect.y),
            w: round(rect.width),
            h: round(rect.height),
          }
        : null,
      deviceBox: deviceRect
        ? {
            x: round(deviceRect.x),
            y: round(deviceRect.y),
            w: round(deviceRect.width),
            h: round(deviceRect.height),
          }
        : null,
      canvasOpacity: canvas ? Number(getComputedStyle(canvas).opacity).toFixed(2) : null,

      /*
       * 전환 구간 진단용 — 활성 씬만 보면 "옆 씬이 투명해서 화면이 비었다"를 못 잡는다.
       * 화면에 닿아 있는 모든 씬의 프레임 컨테이너 opacity 와 캔버스 위치를 함께 남긴다.
       */
      frames: Array.from(document.querySelectorAll('[data-scene-index]'))
        .map((el) => {
          const holder = el.querySelector('[data-scene-frame]');
          if (!holder) return null;
          const box = holder.getBoundingClientRect();
          const cv = el.querySelector('canvas');
          return {
            index: Number(el.dataset.sceneIndex),
            opacity: Number(getComputedStyle(holder).opacity).toFixed(2),
            frame: cv?.dataset.frame ?? null,
            box: { x: round(box.x), y: round(box.y), w: round(box.width), h: round(box.height) },
            onScreen: box.bottom > 0 && box.top < window.innerHeight,
          };
        })
        .filter(Boolean),
    };
  });
}

/**
 * "화면이 비었는지"의 정량 지표 — 뷰포트 대비 **불투명한 콘텐츠가 덮은 면적(%)**.
 *
 * 전환 구간 결함은 요소가 사라진 게 아니라 opacity 0 으로 남아 있는 형태라
 * bbox 존재 여부로는 안 잡힌다. 면적 × opacity 로 세면 곧바로 드러난다.
 */
async function measureCoverage(page) {
  return page.evaluate(() => {
    const covered = Array.from(
      document.querySelectorAll('[data-scene-frame], [data-scene-message]'),
    )
      .map((el) => {
        const r = el.getBoundingClientRect();
        const op = Number(getComputedStyle(el).opacity);
        const h = Math.max(0, Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top));
        const w = Math.max(0, Math.min(window.innerWidth, r.right) - Math.max(0, r.left));
        return op * w * h;
      })
      .reduce((a, b) => a + b, 0);
    return Math.round((covered / (window.innerWidth * window.innerHeight)) * 100);
  });
}

/**
 * 지금 캔버스에 **그려져 있는 픽셀**의 지문.
 * 원본 캔버스를 160×100 으로 줄여 읽고 FNV-1a 해시(고유 판정) + 그레이스케일 배열
 * (인접 표본 차이 계산)을 돌려준다. 프레임 인덱스가 아니라 그림 자체를 보는 게 핵심.
 */
async function readCanvasSignature(page, sceneIndex) {
  return page.evaluate((index) => {
    const section = document.querySelector(`[data-scene-index="${index}"]`);
    const canvas = section?.querySelector('canvas');
    if (!canvas || !canvas.width) return null;

    const probe = document.createElement('canvas');
    probe.width = 160;
    probe.height = 100;
    const context = probe.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(canvas, 0, 0, probe.width, probe.height);
    const { data } = context.getImageData(0, 0, probe.width, probe.height);

    let hash = 2166136261;
    const gray = [];
    for (let i = 0; i < data.length; i += 4) {
      hash ^= data[i];
      hash = Math.imul(hash, 16777619);
      hash ^= data[i + 1];
      hash = Math.imul(hash, 16777619);
      hash ^= data[i + 2];
      hash = Math.imul(hash, 16777619);
      gray.push(Math.round((data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000));
    }
    return { hash: (hash >>> 0).toString(16), gray, frame: canvas.dataset.frame ?? null };
  }, sceneIndex);
}

/** 두 표본의 평균 픽셀 차이(0~255). 값이 크면 인접 프레임이 급점프한다는 뜻. */
function meanDelta(a, b) {
  if (!a || !b || a.length !== b.length) return null;
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

/** 캔버스 bbox 가 뷰포트를 넘거나(오버플로) 화면 밖으로 나가면 실패로 표시한다. */
function judgeBox(box, viewport) {
  if (!box) return '캔버스 없음';
  const problems = [];
  if (box.x < -1) problems.push(`좌측 ${-box.x}px 잘림`);
  if (box.y < -1) problems.push(`상단 ${-box.y}px 잘림`);
  if (box.x + box.w > viewport.width + 1)
    problems.push(`우측 ${box.x + box.w - viewport.width}px 넘침`);
  if (box.y + box.h > viewport.height + 1)
    problems.push(`하단 ${box.y + box.h - viewport.height}px 넘침`);
  return problems.length ? problems.join(', ') : 'OK (프레임 전체 노출)';
}

async function main() {
  const allIds = [...SCENE_SHOTS, ...TRANSITION_SHOTS].map((s) => s.id);
  const requested = (process.env.SCENES || allIds.join(','))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const alive = await fetch(BASE_URL).catch(() => null);
  if (!alive) throw new Error(`개발 서버에 접속할 수 없습니다: ${BASE_URL} (\`yarn dev\` 먼저)`);

  const engine = ENGINE_NAME === 'webkit' ? webkit : chromium;
  const browser = await engine.launch({ headless: !HEADED });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: 'light',
    /*
     * 동작 줄이기에서도 스크럽은 유지된다(사용자 주도 동작). 이 값으로 꺼지는 것은
     * 감속·카운트업·리빌 같은 자동 모션뿐이므로, 여기서도 시퀀스는 재생돼야 한다.
     */
    reducedMotion: process.env.REDUCED_MOTION === 'reduce' ? 'reduce' : 'no-preference',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  });

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'survey_state_v1',
        JSON.stringify({ status: 'dismissed', at: Date.now() }),
      );
    } catch {
      /* storage 접근 불가 환경은 무시 */
    }
  });

  const consoleErrors = [];
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));

  await page.goto(`${BASE_URL}/${LNG}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.addStyleTag({ content: HIDE_NOISE_CSS });
  await page.waitForSelector('.landing-stage', { timeout: 30_000 });
  // 시퀀스 프레임이 최소한 몇 장은 붙어야 캔버스가 비지 않는다.
  await sleep(2500);

  const layout = await measureScenes(page);
  console.log(
    `\n[${ENGINE_NAME} ${VIEWPORT.width}×${VIEWPORT.height}] 문서 높이 ${layout.documentHeight}px · 씬 ${layout.sections.length}개`,
  );
  layout.sections.forEach((s) => console.log(`  · scene ${s.index}: top ${s.top} / h ${s.height}`));

  const rows = [];

  /** 절대 스크롤 위치 하나를 찍고 진단값을 남긴다. */
  const captureAt = async ({ scene, label, ratio, target, file }) => {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), target);
    // 감속(rAF) 루프가 정착할 시간을 준다. 정착 전에 찍으면 중간 프레임이 잡힌다.
    await sleep(900);

    const state = await readSceneState(page);
    const coverage = await measureCoverage(page);
    await page.screenshot({ path: file });

    rows.push({
      scene,
      label,
      ratio,
      scrollY: target,
      activeIndex: state.activeIndex,
      frame: state.frame,
      canvas: state.canvasBox,
      device: state.deviceBox,
      opacity: state.canvasOpacity,
      frames: state.frames,
      coverage,
      verdict: judgeBox(state.canvasBox, VIEWPORT),
      file,
    });
  };

  const sectionRange = (index) => {
    const section = layout.sections.find((s) => s.index === index);
    if (!section) return null;
    // sticky 씬은 마지막 1vh 에서 고정이 풀리므로 그 몫을 빼고 비율을 잡는다.
    const usable = Math.max(1, section.height - layout.innerHeight);
    return (ratio) => Math.round(section.top + usable * ratio);
  };

  for (const shot of TRANSITION_SHOTS) {
    if (!requested.includes(shot.id)) continue;
    const fromAt = sectionRange(shot.from.index);
    const toAt = sectionRange(shot.to.index);
    if (!fromAt || !toAt) continue;

    const dir = path.join(OUT_ROOT, shot.id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    const start = fromAt(shot.from.ratio);
    const end = toAt(shot.to.ratio);
    for (let i = 0; i < shot.steps; i += 1) {
      const t = shot.steps === 1 ? 0 : i / (shot.steps - 1);
      const target = Math.round(start + (end - start) * t);
      await captureAt({
        scene: shot.id,
        label: `t${Math.round(t * 100)}`,
        ratio: t,
        target,
        file: path.join(dir, `${String(i + 1).padStart(2, '0')}-y${target}.png`),
      });
    }
  }

  for (const shot of SCENE_SHOTS) {
    if (!requested.includes(shot.id)) continue;
    const section = layout.sections.find((s) => s.index === shot.index);
    if (!section) {
      console.log(`  ! ${shot.id}: 섹션을 찾지 못했습니다(index=${shot.index})`);
      continue;
    }

    const dir = path.join(OUT_ROOT, shot.id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    const at = sectionRange(shot.index);
    for (let i = 0; i < shot.ratios.length; i += 1) {
      const ratio = shot.ratios[i];
      await captureAt({
        scene: shot.id,
        label: `r${Math.round(ratio * 100)}`,
        ratio,
        target: at(ratio),
        file: path.join(dir, `${String(i + 1).padStart(2, '0')}-r${Math.round(ratio * 100)}.png`),
      });
    }
  }

  /*
   * 씬을 촘촘히 훑으며 캔버스 픽셀 지문을 모은다.
   * 여기가 "시퀀스가 실제로 재생되는가"의 최종 판정선이다.
   */
  const motionRows = [];
  for (const scene of MOTION_SCENES) {
    if (!requested.includes(scene.id)) continue;
    const at = sectionRange(scene.index);
    if (!at) continue;

    const hashes = [];
    const frames = [];
    const deltas = [];
    let previousGray = null;

    for (let i = 0; i < MOTION_SAMPLES; i += 1) {
      const ratio = 0.03 + (0.94 * i) / (MOTION_SAMPLES - 1);
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), at(ratio));
      await sleep(700);
      const signature = await readCanvasSignature(page, scene.index);
      if (!signature) continue;
      hashes.push(signature.hash);
      frames.push(signature.frame);
      const delta = meanDelta(previousGray, signature.gray);
      if (delta !== null) deltas.push(delta);
      previousGray = signature.gray;
    }

    motionRows.push({
      id: scene.id,
      samples: hashes.length,
      unique: new Set(hashes).size,
      frames,
      avgDelta: deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0,
      maxDelta: deltas.length ? Math.max(...deltas) : 0,
    });
  }

  await browser.close();

  console.log('\n─ 촬영 결과 ─────────────────────────────────────────────');
  rows.forEach((r) => {
    const box = r.canvas ? `${r.canvas.w}×${r.canvas.h} @(${r.canvas.x},${r.canvas.y})` : '—';
    // 화면에 걸쳐 있는 모든 씬 프레임의 opacity — 전환 구간 공백의 직접 증거.
    const onScreen = (r.frames ?? [])
      .filter((f) => f.onScreen)
      .map((f) => `#${f.index} op${f.opacity} f${f.frame ?? '-'} y${f.box.y}`)
      .join(' | ');
    console.log(
      `${r.scene.padEnd(10)} ${String(r.label).padStart(5)}  y=${String(r.scrollY).padStart(6)}  scene=${String(r.activeIndex).padStart(2)}  frame=${String(r.frame ?? '—').padStart(3)}  cover=${String(r.coverage ?? '—').padStart(3)}%  canvas=${box.padEnd(22)} ${r.verdict}`,
    );
    if (onScreen) console.log(`${' '.repeat(11)}└ 화면 내 프레임: ${onScreen}`);
  });
  if (motionRows.length) {
    console.log('\n─ 캔버스 픽셀 해시(시퀀스가 실제로 재생되는가) ────────────');
    motionRows.forEach((row) => {
      const pass = row.unique >= MOTION_MIN_UNIQUE ? '✔ 통과' : '✖ 실패';
      console.log(
        `${pass}  ${row.id.padEnd(8)} 표본 ${row.samples} · 고유 이미지 ${row.unique}` +
          ` (기준 ${MOTION_MIN_UNIQUE}) · 인접 평균차 ${row.avgDelta.toFixed(2)} / 최대 ${row.maxDelta.toFixed(2)}`,
      );
      console.log(`${' '.repeat(11)}└ 프레임 인덱스: ${row.frames.join(' → ')}`);
    });
  }

  console.log(`\n저장 위치: ${OUT_ROOT}`);
  console.log(
    consoleErrors.length
      ? `\n콘솔 에러 ${consoleErrors.length}건:\n  ${consoleErrors.slice(0, 10).join('\n  ')}`
      : '\n콘솔 에러 0건',
  );
  console.log(
    '\n※ 저장된 PNG 를 직접 열어 (a) 도구 UI 전체 노출 (b) 텍스트 가독성 (c) 제품 샷 완성도 를 판정할 것.',
  );

  const motionFailures = motionRows.filter((row) => row.unique < MOTION_MIN_UNIQUE);
  if (motionFailures.length) {
    throw new Error(
      `시퀀스 정지 의심(고유 이미지 ${MOTION_MIN_UNIQUE}개 미만): ` +
        motionFailures.map((row) => `${row.id} ${row.unique}/${row.samples}`).join(', '),
    );
  }
}

/* =========================================================================
 * MODE=matrix — 스크럽 **활성 조건** 검증 매트릭스
 *
 * 위 `main()` 은 "기본 조합 한 벌"을 깊게 본다. 그것만으로는 활성 조건 회귀를 못 잡는다.
 * 실제로 `SCRUB_QUERY` 에 `prefers-reduced-motion: no-preference` 가 들어 있어
 * **동작 줄이기를 켠 사용자에게는 시퀀스가 통째로 꺼져 있었는데**, Playwright 기본값이
 * no-preference 라 모든 촬영이 통과했다.
 *
 * 그래서 여기서는 (a) 기본 (b) 동작 줄이기 (c) 1000px (d) 390px 네 조합을 각각 돌리고,
 * 판정 근거를 **캔버스 getImageData 가 아니라 화면 클립 스크린샷 해시**로 잡는다.
 * getImageData 는 캔버스 버퍼만 보므로 "엔진이 안 돌아 캔버스가 display:none" 이거나
 * 포스터에 가려진 상태를 통과시켜 버린다. 화면 클립은 사용자가 보는 것과 같다.
 * ========================================================================= */

const MATRIX_PROFILES = [
  { id: 'a-default', label: '기본', viewport: { width: 1440, height: 900 }, reduced: false },
  { id: 'b-reduced', label: '동작 줄이기', viewport: { width: 1440, height: 900 }, reduced: true },
  { id: 'c-narrow', label: '1000px 폭', viewport: { width: 1000, height: 900 }, reduced: false },
  { id: 'd-mobile', label: '모바일 390px', viewport: { width: 390, height: 844 }, reduced: false },
  /*
   * 스크럽 하한(768px) 바로 위 + 낮은 창. sticky 씬은 100svh 안에 갇히므로 폭보다 **높이**가
   * 잘림의 실제 원인이다. 하한을 1024 → 768 로 내리면서 이 조합을 회귀 대상에 넣는다.
   */
  {
    id: 'e-short',
    label: '좁고 낮은 창 800×700',
    viewport: { width: 800, height: 700 },
    reduced: false,
  },
];

/** 조합당 씬별 표본 수(요구 기준 12 이상) */
const MATRIX_SAMPLES = Number(process.env.MATRIX_SAMPLES || 13);
/** 스크럽이 켜진 조합의 합격선(고유 화면 수) */
const MATRIX_MIN_UNIQUE = Number(process.env.MATRIX_MIN_UNIQUE || 10);

const sha1 = (buffer) => crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 12);

/** 스티키 프레임 **내부 화면**(브라우저 창 프레임의 스크린 영역)의 뷰포트 좌표. */
async function readClipBox(page, sceneIndex) {
  return page.evaluate((index) => {
    const section = document.querySelector(`[data-scene-index="${index}"]`);
    if (!section) return null;
    const screen =
      section.querySelector('[data-scene-frame] .landing-device-screen') ??
      section.querySelector('[data-scene-sticky]');
    if (!screen) return null;
    const r = screen.getBoundingClientRect();
    return {
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
      /** 뷰포트 밖으로 나간 양(잘림 판정용) */
      overflow: {
        left: Math.max(0, -r.x),
        top: Math.max(0, -r.y),
        right: Math.max(0, r.right - window.innerWidth),
        bottom: Math.max(0, r.bottom - window.innerHeight),
      },
      visible: r.bottom > 0 && r.top < window.innerHeight && r.width > 0 && r.height > 0,
    };
  }, sceneIndex);
}

/** 뷰포트 안으로 잘라 낸 클립 사각형(스크린샷 API 는 뷰포트 밖 좌표를 거부한다). */
function clampClip(box, viewport) {
  const x = Math.max(0, Math.min(viewport.width - 1, box.x));
  const y = Math.max(0, Math.min(viewport.height - 1, box.y));
  const width = Math.max(1, Math.min(viewport.width - x, box.x + box.w - x));
  const height = Math.max(1, Math.min(viewport.height - y, box.y + box.h - y));
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

/** 씬을 훑을 스크롤 위치 목록. 엔진이 꺼진 경로는 자연 높이 전체를 훑는다. */
function sampleTops(section, innerHeight, engineOn, count) {
  const tops = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / (count - 1);
    if (engineOn) {
      const usable = Math.max(1, section.height - innerHeight);
      tops.push(Math.round(section.top + usable * (0.03 + 0.94 * t)));
    } else {
      const start = Math.max(0, section.top - innerHeight * 0.55);
      const end = section.top + section.height - innerHeight * 0.2;
      tops.push(Math.round(start + Math.max(1, end - start) * t));
    }
  }
  return tops;
}

/**
 * 히어로 카운트업이 **즉시 최종값**인지 확인한다.
 * 로드 직후 1.6초 동안 값을 촘촘히 읽어, 값이 한 번이라도 바뀌면 애니메이션이 돈 것이다.
 */
async function probeCountUp(page) {
  return page.evaluate(async () => {
    const read = () =>
      Array.from(document.querySelectorAll('dl dd'))
        .map((el) => el.textContent?.trim() ?? '')
        .join('|');
    const seen = [];
    const deadline = Date.now() + 1600;
    while (Date.now() < deadline) {
      const value = read();
      if (seen[seen.length - 1] !== value) seen.push(value);
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    return { distinct: seen.length, first: seen[0] ?? '', last: seen[seen.length - 1] ?? '' };
  });
}

async function runProfile(engineName, profile) {
  const engine = engineName === 'webkit' ? webkit : chromium;
  const browser = await engine.launch({ headless: !HEADED });
  const context = await browser.newContext({
    viewport: profile.viewport,
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: profile.reduced ? 'reduce' : 'no-preference',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  });
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'survey_state_v1',
        JSON.stringify({ status: 'dismissed', at: Date.now() }),
      );
    } catch {
      /* storage 접근 불가 환경은 무시 */
    }
  });

  const consoleErrors = [];
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));

  await page.goto(`${BASE_URL}/${LNG}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.addStyleTag({ content: HIDE_NOISE_CSS });
  await page.waitForSelector('.landing-stage', { timeout: 30_000 });

  const countUp = await probeCountUp(page);

  // 시퀀스 프레임이 최소한 몇 장은 붙어야 캔버스가 비지 않는다.
  await sleep(2500);

  const engineOn = await page.evaluate(
    () => document.querySelector('.landing-stage')?.hasAttribute('data-scene') ?? false,
  );
  const layout = await measureScenes(page);

  const dir = path.join(OUT_ROOT, 'matrix', engineName, profile.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const scenes = [];
  for (const scene of MOTION_SCENES) {
    const section = layout.sections.find((s) => s.index === scene.index);
    if (!section) continue;

    const tops = sampleTops(section, layout.innerHeight, engineOn, MATRIX_SAMPLES);
    const hashes = [];
    const sizes = [];
    const clipProblems = [];
    let partial = 0;
    let whole = 0;

    for (let i = 0; i < tops.length; i += 1) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), tops[i]);
      await sleep(profile.reduced ? 420 : 800);

      const box = await readClipBox(page, scene.index);
      const overflow = box?.overflow;
      const cut = box
        ? [
            overflow.left > 1 ? `좌${Math.round(overflow.left)}` : '',
            overflow.top > 1 ? `상${Math.round(overflow.top)}` : '',
            overflow.right > 1 ? `우${Math.round(overflow.right)}` : '',
            overflow.bottom > 1 ? `하${Math.round(overflow.bottom)}` : '',
          ]
            .filter(Boolean)
            .join(',')
        : '없음';

      /*
       * 엔진이 도는 경로는 프레임이 sticky 로 화면에 **갇혀** 있으므로 어느 표본에서도
       * 뷰포트를 벗어나면 안 된다(= 잘림). 엔진이 꺼진 경로는 자연 스크롤이라 프레임이
       * 들어오고 나가는 게 정상이므로, "온전히 다 보이는 위치가 있는가"만 본다.
       */
      if (cut === '') whole += 1;
      else if (engineOn) clipProblems.push(`s${i}:${cut}`);
      else partial += 1;

      if (!box || !box.visible) continue;
      const clip = clampClip(box, profile.viewport);
      // 화면 가장자리에 몇 px 만 걸친 표본은 지문으로서 의미가 없다.
      if (clip.height < 40 || clip.width < 40) continue;

      const buffer = await page.screenshot({ clip });
      hashes.push(sha1(buffer));
      sizes.push(buffer.length);

      // 대표 컷만 남긴다(첫·중간·끝) — 육안 확인용.
      if (i === 0 || i === Math.floor(tops.length / 2) || i === tops.length - 1) {
        fs.writeFileSync(path.join(dir, `${scene.id}-s${String(i).padStart(2, '0')}.png`), buffer);
      }
    }

    scenes.push({
      id: scene.id,
      samples: hashes.length,
      unique: new Set(hashes).size,
      partial,
      whole,
      /** 단색(빈 화면) 의심 — PNG 는 균일한 그림일수록 극단적으로 작아진다. */
      minBytes: sizes.length ? Math.min(...sizes) : 0,
      clipProblems,
    });
  }

  // 전체 화면 대표 컷 — 잘림/빈 화면 육안 확인용.
  for (const scene of MOTION_SCENES) {
    const section = layout.sections.find((s) => s.index === scene.index);
    if (!section) continue;
    const [, mid] = sampleTops(section, layout.innerHeight, engineOn, 3);
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), mid);
    await sleep(profile.reduced ? 420 : 800);
    await page.screenshot({ path: path.join(dir, `full-${scene.id}.png`) });
  }

  await browser.close();

  return { engineName, profile, engineOn, countUp, scenes, consoleErrors, dir };
}

async function runMatrix() {
  const alive = await fetch(BASE_URL).catch(() => null);
  if (!alive) throw new Error(`개발 서버에 접속할 수 없습니다: ${BASE_URL} (\`yarn dev\` 먼저)`);

  const engines = (process.env.ENGINES || 'chromium,webkit')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const wanted = (process.env.PROFILES || MATRIX_PROFILES.map((p) => p.id).join(','))
    .split(',')
    .map((s) => s.trim());

  const results = [];
  for (const engineName of engines) {
    for (const profile of MATRIX_PROFILES) {
      if (!wanted.includes(profile.id)) continue;
      console.log(`\n▶ ${engineName} · ${profile.id}(${profile.label}) 촬영 중…`);
      results.push(await runProfile(engineName, profile));
    }
  }

  console.log('\n─ 스크럽 활성 조건 매트릭스 ────────────────────────────────');
  const failures = [];
  results.forEach((r) => {
    const { profile } = r;
    console.log(
      `\n[${r.engineName}] ${profile.id} ${profile.label} ${profile.viewport.width}×${profile.viewport.height}` +
        ` · reducedMotion=${profile.reduced ? 'reduce' : 'no-preference'} · 엔진 ${r.engineOn ? '가동' : '정지(포스터)'}`,
    );
    console.log(
      `  카운트업: 값 변화 ${r.countUp.distinct}회 · 첫 "${r.countUp.first}" → 끝 "${r.countUp.last}"` +
        (profile.reduced
          ? r.countUp.distinct === 1 && r.countUp.first === r.countUp.last
            ? '  ✔ 즉시 최종값'
            : '  ✖ 애니메이션이 돌았다'
          : ''),
    );
    if (profile.reduced && !(r.countUp.distinct === 1 && r.countUp.first === r.countUp.last)) {
      failures.push(`${r.engineName}/${profile.id}: reduced-motion 카운트업이 즉시 최종값이 아님`);
    }

    r.scenes.forEach((s) => {
      const uniqueOk = !r.engineOn || s.unique >= MATRIX_MIN_UNIQUE;
      // 엔진 정지 경로는 "온전히 보이는 위치가 한 번이라도 있는가"가 합격선이다.
      const frameOk = r.engineOn ? s.clipProblems.length === 0 : s.whole > 0;
      const ok = uniqueOk && frameOk;
      console.log(
        `  ${ok ? '✔' : '✖'} ${s.id.padEnd(8)} 표본 ${s.samples} · 고유 화면 ${s.unique}` +
          `${r.engineOn ? ` (기준 ${MATRIX_MIN_UNIQUE})` : ' (엔진 정지 경로 — 정지가 정상)'}` +
          ` · 최소 PNG ${(s.minBytes / 1024).toFixed(1)}KB · 프레임 전체 노출 ${s.whole}표본` +
          (r.engineOn
            ? s.clipProblems.length
              ? ` · 잘림 ${s.clipProblems.join(' ')}`
              : ' · 잘림 없음'
            : ` · 부분 노출 ${s.partial}표본(자연 스크롤 — 정상)`),
      );
      if (!uniqueOk) failures.push(`${r.engineName}/${profile.id}/${s.id}: 고유 ${s.unique}`);
      if (!frameOk)
        failures.push(
          `${r.engineName}/${profile.id}/${s.id}: ` +
            (r.engineOn ? `잘림 ${s.clipProblems.join(' ')}` : '프레임이 온전히 보이는 위치 없음'),
        );
    });
    if (r.consoleErrors.length) {
      console.log(`  콘솔 에러 ${r.consoleErrors.length}건: ${r.consoleErrors[0]}`);
    }
    console.log(`  저장: ${r.dir}`);
  });

  if (failures.length) {
    console.log(`\n✖ 실패 ${failures.length}건`);
    failures.forEach((f) => console.log(`  · ${f}`));
    process.exitCode = 1;
  } else {
    console.log('\n✔ 네 조합 모두 통과');
  }
}

const entry = process.env.MODE === 'matrix' ? runMatrix : main;

entry().catch((error) => {
  console.error(error);
  process.exit(1);
});
