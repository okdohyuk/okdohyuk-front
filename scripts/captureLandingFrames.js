/* eslint-disable no-console, no-await-in-loop */

/**
 * 랜딩 스토리 스크롤 시퀀스용 "실사용 도구" 프레임 촬영기.
 *
 * 코드로 흉내 낸 미니 프리뷰 대신, 실제 도구 페이지를 Playwright 로 조작하면서
 * 프레임을 연속 촬영해 webp 시퀀스로 저장한다. 랜딩의 `LandingSequenceCanvas` 가
 * 스크롤 진행도에 맞춰 이 프레임들을 캔버스에 그린다.
 *
 * ── 실행법 ────────────────────────────────────────────────────────────────
 *   1) 개발 서버 기동:  yarn dev            (http://localhost:3000)
 *   2) 촬영:            node scripts/captureLandingFrames.js
 *
 *   환경 변수(선택)
 *     BASE_URL=http://localhost:3000   대상 서버
 *     TOOLS=pokemon,clock,live         촬영할 도구만 지정(쉼표 구분)
 *     FRAMES=90                        도구당 프레임 수
 *     QUALITY=72                       webp 품질
 *     WIDTH=1280                       저장 폭(px). 뷰포트 1280×800 을 그대로 담는다
 *     MIN_UNIQUE_RATIO=0.85            고유 프레임 비율 합격선(미달 시 실패 종료)
 *     HEADED=1                         브라우저 창을 띄워서 확인
 *
 * ── 설계 원칙: "매 프레임이 달라야 한다" ─────────────────────────────────────
 * 시퀀스 재생은 프레임을 바꿔 그리는 것으로 끝나지 않는다. **그려지는 이미지가 실제로
 * 달라야** 사용자가 애니메이션으로 느낀다. 예전 타임라인은 `조작 1회 + 대기 N프레임`
 * 구조라 대기 구간이 통째로 같은 화면이었고(포켓몬 90장 중 고유 3장), 스크롤을 내려도
 * 화면이 멈춘 것처럼 보였다.
 *
 * 그래서 타임라인 단위를 **프레임 1장**으로 낮췄다(`shot(wait, act)`). 프레임마다
 *   - 포켓몬: 5프레임마다 방어 타입 교체(18타입 전부) + 매 프레임 1px 씩 천천히 팬(pan)
 *   - 서버시계: 밀리초가 매 프레임 갱신 + 18프레임마다 사이트 전환(+ 커스텀 서버 타이핑)
 *   - 멀티라이브: 스트림 ID 한 글자씩 타이핑 + 플랫폼 전환 + **움직이는 라이브 플레이스홀더**
 * 처럼 반드시 무언가가 바뀌게 만든다. 촬영 직후 md5 로 고유 프레임 비율을 세고
 * `UNIQUE_RATIO_MIN` 미달이면 실패로 끝난다(회귀 방지 게이트).
 *
 * ── 주의 ──────────────────────────────────────────────────────────────────
 * - 프레임 수를 바꾸면 `src/assets/datas/landingSequences.ts` 의 `frameCount` 도
 *   반드시 같이 고쳐야 한다(초과 지정 시 404, 미달 지정 시 시퀀스가 중간에 끊긴다).
 * - 멀티라이브의 외부 스트림(치지직/트위치/유튜브)은 X-Frame-Options 때문에
 *   localhost 에서 임베드가 거부된다. 촬영 시에만 iframe 요청을 로컬 플레이스홀더로
 *   가로채 "레이아웃이 어떻게 배치되는가"를 보여준다. 도구 UI 조작 자체는 실제 그대로다.
 * - 광고/설문/동의 배너는 촬영 화면에서 제외한다(랜딩 시각물에 들어갈 이유가 없다).
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const sharp = require('sharp');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FRAMES_PER_TOOL = Number(process.env.FRAMES || 90);
const WEBP_QUALITY = Number(process.env.QUALITY || 72);
const OUTPUT_WIDTH = Number(process.env.WIDTH || 1280);
const HEADED = process.env.HEADED === '1';

/**
 * 합격선 — 도구별 고유 프레임 비율.
 * 중복이 많다는 것은 "그 구간에서 화면이 멈춰 있다"는 뜻이고, 그러면 스크롤을 내려도
 * 애니메이션으로 보이지 않는다. 90장 기준 77장(85%) 이상이 서로 달라야 통과.
 */
const UNIQUE_RATIO_MIN = Number(process.env.MIN_UNIQUE_RATIO || 0.85);

/*
 * 뷰포트 = 출력 해상도와 같은 1280×800(16:10).
 *
 * 예전에는 1280×800 으로 찍은 뒤 `clipSelector` 로 본문 컬럼 주변을 다시 잘라냈는데,
 * 그 크롭이 카드 중간을 지나가 "확대된 조각"처럼 보이는 원인이었다. 이제는
 *  (1) 좌우 광고 레일(`aside.flex-1`)을 숨겨 본문 컬럼이 화면 한가운데 오게 하고
 *  (2) 뷰포트 전체를 그대로 찍는다 → 잘라내기 없음 = 카드가 중간에서 끊기지 않는다.
 * deviceScaleFactor 2 로 찍고 1280px 로 축소 저장해(2배 슈퍼샘플링) 글자를 또렷하게 만든다.
 *
 * 캔버스 해상도를 1600 이 아니라 1280 으로 낮춘 이유는 **가독성**이다.
 * 화면에 그려지는 글자 크기 = 원본 폰트 × (프레임 표시 폭 / 캔버스 폭) 이라,
 * 캔버스 폭이 작을수록 같은 표시 폭에서 글자가 크게 보인다. 1600 일 때는 랜딩의
 * 900px 짜리 제품 샷에서 본문이 8px 로 뭉개졌다.
 */
const DEFAULT_VIEWPORT = { width: 1280, height: 800 };
const DEFAULT_SCALE = 2;

const OUTPUT_ROOT = path.join(__dirname, '..', 'public', 'landing', 'seq');

/*
 * 랜딩 시각물에 들어갈 이유가 없는 요소는 촬영에서 제외한다.
 * 단 멀티라이브의 추가 컨트롤(div.fixed.bottom-4.left-4)은 도구 UI 자체이므로 `.fixed` 를
 * 통째로 숨기지 않고 대상을 하나씩 지정한다.
 */
const HIDE_CHROME_CSS = `
  ins.adsbygoogle, .adsbygoogle { display: none !important; }
  [role="dialog"] { display: none !important; }
  nav.fixed { display: none !important; }
  footer { display: none !important; }
  button[aria-label="Select language"] { display: none !important; }
  [aria-label="Select language"] { display: none !important; }
  /* 개발 서버에서만 붙는 Next.js 개발 도구 인디케이터(좌하단 동그라미) */
  nextjs-portal { display: none !important; }
  /* 좌우 광고 레일(AsideScreenWrapper) — 제품 샷에서는 본문만 남긴다. */
  aside.flex-1 { display: none !important; }
  /*
   * 본문 컬럼 상한(lg:max-w-[1024px])을 풀어 프레임을 꽉 채운다.
   * 그대로 두면 1280 프레임 안에서 본문이 976px 만 쓰고 좌우가 텅 비어,
   * 제품 샷이 "여백만 큰 스크린샷"으로 보인다.
   */
  div:has(> main#main-content) { max-width: none !important; }
`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 특정 요소의 윗변이 화면 상단에서 `margin`px 떨어지도록 스크롤한다.
 *
 * 고정 픽셀 offset 으로 스크롤하면 도구 조작으로 콘텐츠 높이가 바뀔 때마다 구도가
 * 어긋나 카드가 중간에서 잘린다. 앵커 기준이면 조작 뒤에도 구도가 유지된다.
 */
async function anchorScroll(page, selector, margin = 24, settle = 220) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return;
  await page.evaluate(({ delta }) => window.scrollBy({ top: delta, behavior: 'instant' }), {
    delta: Math.round(box.y - margin),
  });
  await sleep(settle);
}

/**
 * 촬영 타임라인의 최소 단위 = **프레임 1장**.
 * `act` 를 실행하고 `wait` ms 뒤에 1장을 찍는다. 조각(beat) 단위로 묶어 "한 번 조작하고
 * 여러 장"을 찍던 예전 구조가 중복 프레임의 원인이었으므로, 프레임마다 무엇을 바꿀지
 * 직접 적게 만든다.
 */
const shot = (wait, act) => ({ wait, act });

/** 조작 없이 시간만 흐르는 프레임(도구 자체가 계속 변할 때만 쓸 것). */
const hold = (count, wait) => Array.from({ length: count }, () => shot(wait));

/** 한 글자씩 타이핑하는 프레임 묶음 — 프레임마다 입력값이 달라진다. */
const typeShots = (selector, text, wait) =>
  Array.from(text).map((char, index) =>
    shot(wait, async (page) => {
      if (index === 0) await page.click(selector);
      await page.keyboard.type(char);
    }),
  );

// ───────────────────────────────────────────────────────────── 도구별 타임라인

/** 서버 시계 사이트 탭 — 라벨은 `site[0].toUpperCase() + rest` 규칙으로 렌더된다. */
const CLOCK_SITES = ['Yes24', 'Interpark', 'Melon'];
const CLOCK_CUSTOM_HOST = 'okdohyuk.dev';

const LIVE_INPUT = 'input[placeholder="생방송의 ID를 입력하세요."]';

const TOOLS = {
  /**
   * 포켓몬 타입 계산기 — 18개 방어 타입을 차례로 갈아 끼우며 상성 결과 패널이
   * 계속 바뀌는 흐름(타입당 5프레임). 여기에 매 프레임 1px 씩 아래로 내려가는
   * 완만한 팬을 겹쳐, 타입이 그대로인 프레임끼리도 화면이 미세하게 이어져 흐른다.
   * 타입 버튼은 `title` 속성이 한글 타입명이라 가장 안정적인 셀렉터다
   * (결과 패널의 배지는 비인터랙티브 `span` 이라 `button[title]` 은 선택 그리드에만 매칭된다).
   */
  pokemon: {
    url: '/ko/pokemon-type-calculator',
    /*
     * 페이지 전체(1213px)는 800px 프레임에 안 들어간다. 안내 헤더 카드는 마케팅 샷에
     * 필요 없는 부분이라 스크롤로 걷어내고, **도구 본체**(방어 타입 선택 → 선택된 타입 →
     * 상성 분석 결과)가 위에서부터 들어오도록 카드 상단을 앵커로 잡는다.
     */
    anchor: 'text=방어 타입 선택',
    /*
     * 타입을 **1개**만 유지하는 흐름이라(새 타입 선택 → 직전 타입 해제) 결과가 항상
     * 4단계(2배·1배·½배·0배) 이하로 유지돼 구도가 흔들리지 않는다. 2개를 고르면
     * 4배·¼배 단계가 더 생겨 프레임 밖으로 밀린다. 카피("공격 타입 하나만 고르면 …")와도
     * 이쪽이 정확히 맞는다. (pan 이 있으면 이 값 대신 pan 이 여백을 정한다.)
     */
    anchorMargin: 60,
    /*
     * 프레임마다 앵커 여백을 96 → 6 으로 줄인다 = 90프레임 동안 90px 을 아래로 훑는 팬.
     * 랜딩에서 스크롤을 내리는 방향과 같아 "도구 화면이 같이 스크롤된다"로 읽힌다.
     */
    pan: { from: 96, to: 6 },
    async prepare(page) {
      await page.waitForSelector('button[title="불꽃"]', { timeout: 30_000 });
      await sleep(400);
    },
    async plan(page, total) {
      const titles = await page.$$eval('button[title]', (nodes) =>
        nodes.map((node) => node.getAttribute('title')),
      );
      const perType = Math.max(1, Math.floor(total / titles.length));
      const shots = [];
      let previous = null;

      titles.forEach((title) => {
        // 새 타입을 먼저 고르고 직전 타입을 해제한다 → 항상 1개 선택 = 구도가 고정된다.
        shots.push(
          shot(40, async (p) => {
            await p.click(`button[title="${title}"]`);
            if (previous) {
              await sleep(90);
              await p.click(`button[title="${previous}"]`);
            }
            previous = title;
          }),
        );
        // 선택 링(transition-all 200ms)이 번지는 중간 상태 → 정착 상태 순서로 담는다.
        shots.push(...hold(perType - 1, 90));
      });

      while (shots.length < total) shots.push(shot(90));
      return shots.slice(0, total);
    },
  },

  /**
   * 서버 시계 — 밀리초가 매 프레임 흐르는 위에, 티켓팅 사이트 탭을 차례로 전환해
   * "어느 서버의 시간인가"가 눈에 띄게 바뀌도록 했다(사이트마다 서버 시각도 다르다).
   * 마지막 구간은 커스텀 서버 URL 을 한 글자씩 입력해 okdohyuk.dev 자체 시간으로 마무리한다.
   */
  clock: {
    url: '/ko/server-clock',
    async prepare(page) {
      await page.waitForSelector('p.font-mono.tabular-nums', { timeout: 30_000 });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await sleep(600);
    },
    async plan(page, total) {
      /** 사이트 탭을 누르고 시계가 다시 뜰 때까지 기다린다(로딩 프레임이 길게 남지 않도록). */
      const selectSite = (label) => async (p) => {
        await p.getByRole('button', { name: label, exact: true }).click();
        await p
          .waitForSelector('p.font-mono.tabular-nums', { timeout: 15_000 })
          .catch(() => undefined);
      };

      // 기본 선택(Ticketlink) + 사이트 3개 + 커스텀 = 5구간
      const blocks = 2 + CLOCK_SITES.length;
      const per = Math.floor(total / blocks);
      const shots = [];

      shots.push(...hold(per, 90)); // 초기 Ticketlink
      CLOCK_SITES.forEach((label) => {
        shots.push(shot(120, selectSite(label)));
        shots.push(...hold(per - 1, 90));
      });

      // 커스텀 서버: 탭 열기 → URL 한 글자씩 → 조회 → okdohyuk.dev 서버 시간
      shots.push(shot(160, selectSite('사용자 정의 서버')));
      shots.push(...typeShots('input[placeholder^="사용자 정의 서버 URL"]', CLOCK_CUSTOM_HOST, 80));
      shots.push(
        shot(140, async (p) => {
          await p.getByRole('button', { name: '시간 확인' }).click();
          await p
            .waitForSelector('p.font-mono.tabular-nums', { timeout: 15_000 })
            .catch(() => undefined);
        }),
      );
      while (shots.length < total) shots.push(shot(90));
      return shots.slice(0, total);
    },
  },

  /**
   * 멀티라이브 — 방송 ID 를 한 글자씩 입력하고 플랫폼을 바꿔 가며 레이아웃이
   * 1 → 2 → 3분할로 커지는 흐름. 대기 구간이 정지 화면이 되지 않도록 촬영용
   * 라이브 플레이스홀더 자체가 움직인다(파형·타임코드·스캔라인).
   */
  live: {
    url: '/ko/multi-live',
    /* 멀티라이브는 본문 컬럼이 아니라 화면 전체를 쓰는 풀블리드 도구다. */
    async prepare(page) {
      await page.waitForSelector(LIVE_INPUT, { timeout: 30_000 });
      await sleep(400);
    },
    async plan(page, total) {
      /** 스트림 추가 후 iframe 이 늘어날 때까지 기다린다. */
      const addStream = (count) => async (p) => {
        await p.getByRole('button', { name: '추가하기' }).click();
        await p.waitForFunction(
          (expected) => document.querySelectorAll('iframe[title^="Live "]').length >= expected,
          count,
          { timeout: 15_000 },
        );
      };

      /** 플랫폼 셀렉트를 열고 고르는 4프레임 — 드롭다운이 열리고 닫히는 게 그대로 담긴다. */
      const switchPlatform = (label) => [
        shot(140, (p) => p.locator('button[role="combobox"]').click()),
        shot(160),
        shot(140, (p) => p.getByRole('option', { name: label, exact: true }).click()),
        shot(120),
      ];

      /*
       * 추가 직후 6프레임은 대기 없이 연달아 찍어 **타일이 나타나는 도중**을 담는다.
       * 레이아웃이 1→2→3분할로 바뀌는 순간은 원래 하드 컷이라, 플레이스홀더의
       * fade-in(2.4s) 중간 상태를 끼워 넣어야 프레임끼리 부드럽게 이어진다.
       */
      const afterAdd = (count) => [...hold(6, 10), ...hold(count - 6, 110)];

      const shots = [
        ...hold(2, 110),
        ...typeShots(LIVE_INPUT, 'okdohyuk-live', 85),
        shot(40, addStream(1)),
        ...afterAdd(11),
        ...switchPlatform('트위치'),
        ...typeShots(LIVE_INPUT, 'okdohyuk-desk', 85),
        shot(40, addStream(2)),
        ...afterAdd(11),
        ...switchPlatform('유튜브'),
        ...typeShots(LIVE_INPUT, 'okdohyuk-cam', 85),
        shot(40, addStream(3)),
      ];

      while (shots.length < total) shots.push(shot(110));
      return shots.slice(0, total);
    },
  },
};

/**
 * 멀티라이브 iframe 은 외부 호스트가 localhost 임베드를 거부한다(X-Frame-Options).
 * 촬영용으로만 로컬 플레이스홀더를 응답해 "레이아웃 배치"가 보이도록 한다.
 */
const STREAM_HOST_PATTERN =
  /(chzzk\.naver\.com|twitch\.tv|youtube\.com|youtube-nocookie\.com|sooplive\.co\.kr|afreecatv\.com|kick\.com)/;

/** 임베드 URL 에서 플랫폼 이름과 채널 ID 를 뽑는다(플랫폼마다 위치가 다르다). */
function readStreamIdentity(rawUrl) {
  const platforms = [
    [/chzzk\.naver\.com/, 'CHZZK'],
    [/twitch\.tv/, 'TWITCH'],
    [/youtube(-nocookie)?\.com/, 'YOUTUBE'],
    [/sooplive\.co\.kr|afreecatv\.com/, 'SOOP'],
    [/kick\.com/, 'KICK'],
  ];
  const platform = platforms.find(([pattern]) => pattern.test(rawUrl))?.[1] ?? 'LIVE';

  let id = 'live';
  try {
    const url = new URL(rawUrl);
    // 트위치는 ?channel=, 유튜브는 /embed/{id}, 치지직·숲·킥은 경로 마지막 조각.
    id =
      url.searchParams.get('channel') ||
      url.searchParams.get('v') ||
      decodeURIComponent(url.pathname).split('/').filter(Boolean).pop() ||
      'live';
  } catch {
    id = 'live';
  }
  return { platform, id };
}

/*
 * 플레이스홀더는 **움직인다**. 정지 이미지면 스트림을 추가하지 않는 구간이 통째로
 * 같은 프레임이 되어(예전 live: 90장 중 고유 10장) 시퀀스가 멈춰 보인다.
 * 실제 방송 화면도 계속 움직이므로, 흐르는 타임코드·이퀄라이저·스캔라인으로 그 성질을 흉내 낸다.
 */
const placeholderHtml = (label, platform) => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><style>
  /*
   * 배경을 body 가 아니라 **내부 .stage 에** 칠하는 이유:
   * body 배경은 CSS 배경 전파 규칙상 캔버스(iframe 바탕)에 그려져 body 의 opacity 를
   * 무시한다 → 페이드가 걸리지 않고 흰 화면에서 검은 화면으로 한 프레임 만에 튄다.
   */
  html,body{margin:0;height:100%;overflow:hidden;background:#fff;
            font-family:ui-sans-serif,system-ui,'Apple SD Gothic Neo',sans-serif}
  body{display:flex;align-items:center;justify-content:center;color:#f4f5fb;position:relative}
  .stage{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
         background:linear-gradient(140deg,#181d29,#232a3d 55%,#2c2140);overflow:hidden;
         /*
          * 새 스트림이 들어올 때 흰 화면 → 영상으로 한 프레임 만에 튀지 않게 천천히 나타난다.
          * 촬영은 프레임 1장에 0.25초 안팎이 걸리므로, 2.4초 정도는 끌어야 전환 중간이
          * 여러 장 담긴다(짧게 잡으면 첫 프레임에서 이미 다 나타나 있다).
          */
         animation:reveal 2.4s cubic-bezier(.22,1,.36,1) both}
  @keyframes reveal{from{opacity:0}to{opacity:1}}
  /* 천천히 흐르는 광택 — 프레임마다 위치가 달라진다. */
  .sheen{position:absolute;inset:-40%;background:
      radial-gradient(38% 38% at 50% 50%,rgba(120,140,255,.22),transparent 70%);
      animation:drift 7s linear infinite}
  @keyframes drift{0%{transform:translate(-18%,-8%)}50%{transform:translate(18%,8%)}100%{transform:translate(-18%,-8%)}}
  .scan{position:absolute;left:0;right:0;height:2px;background:rgba(255,255,255,.10);
        animation:scan 3.5s linear infinite}
  @keyframes scan{0%{top:0}100%{top:100%}}
  .card{text-align:center;position:relative}
  .dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#ff4d5e;margin-right:8px;
       animation:blink 1.1s ease-in-out infinite}
  @keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.75)}}
  .badge{font:700 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;opacity:.85}
  .name{margin-top:14px;font-size:26px;font-weight:800;letter-spacing:-.02em}
  .eq{margin-top:16px;display:flex;gap:4px;justify-content:center;align-items:flex-end;height:26px}
  .eq i{display:block;width:5px;border-radius:2px;background:linear-gradient(180deg,#8ea2ff,#5f4bd8);
        animation:bounce .9s ease-in-out infinite}
  @keyframes bounce{0%,100%{height:6px;opacity:.55}50%{height:26px;opacity:1}}
  .time{margin-top:12px;font:600 13px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
        letter-spacing:.08em;color:#c8cfe8}
</style></head>
<body>
  <div class="stage">
  <div class="sheen"></div><div class="scan"></div>
  <div class="card">
    <div class="badge"><span class="dot"></span>LIVE · ${platform}</div>
    <div class="name">${label}</div>
    <div class="eq">${Array.from({ length: 9 })
      .map(
        (_, i) =>
          `<i style="animation-duration:${0.6 + i * 0.11}s;animation-delay:-${i * 0.17}s"></i>`,
      )
      .join('')}</div>
    <div class="time" id="t">00:00.00</div>
  </div>
  </div>
  <script>
    // 흐르는 타임코드 — 매 프레임이 반드시 달라지게 만드는 마지막 보루.
    var started = Date.now();
    setInterval(function () {
      var ms = Date.now() - started;
      var pad = function (n, w) { return String(n).padStart(w, '0'); };
      document.getElementById('t').textContent =
        pad(Math.floor(ms / 60000), 2) + ':' + pad(Math.floor(ms / 1000) % 60, 2) +
        '.' + pad(Math.floor(ms / 10) % 100, 2);
    }, 20);
  </script>
</body></html>`;

// ───────────────────────────────────────────────────────────────────── 촬영

async function captureTool(browser, name, spec) {
  const outputDir = path.join(OUTPUT_ROOT, name);
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const context = await browser.newContext({
    viewport: spec.viewport || DEFAULT_VIEWPORT,
    deviceScaleFactor: spec.scale || DEFAULT_SCALE,
    // 랜딩 배경(라이트 글래스 카드)과 어울리도록 라이트 모드로 통일한다.
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  });

  // 설문 배너는 방문 이력 기반으로 뜨므로 미리 닫힘 상태로 심어둔다.
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

  await context.route(STREAM_HOST_PATTERN, (route) => {
    const { platform, id } = readStreamIdentity(route.request().url());
    route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: placeholderHtml(id, platform),
    });
  });

  const page = await context.newPage();
  await page.goto(`${BASE_URL}${spec.url}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.addStyleTag({ content: HIDE_CHROME_CSS });
  await spec.prepare(page);
  if (spec.anchor) await anchorScroll(page, spec.anchor, spec.anchorMargin);

  const plan = await spec.plan(page, FRAMES_PER_TOOL);
  if (plan.length !== FRAMES_PER_TOOL) {
    throw new Error(`${name}: 타임라인이 ${plan.length}프레임 (기대 ${FRAMES_PER_TOOL})`);
  }

  // 포스터로 쓸 프레임(도구가 가장 잘 드러나는 후반부)만 메모리에 잡아 둔다.
  const posterIndex = Math.round(FRAMES_PER_TOOL * 0.75);
  let posterBuffer = null;
  let bytes = 0;

  /*
   * 프레임을 배열에 모아 두면 1280×800@2 × 90장이 통째로 메모리에 남는다.
   * 찍는 즉시 인코딩해 디스크로 흘려보낸다(피크 메모리 = 버퍼 1개).
   */
  for (let index = 0; index < plan.length; index += 1) {
    const { act, wait } = plan[index];
    if (act) await act(page, index);
    if (wait) await sleep(wait);

    /*
     * 구도 보정 + 팬(pan). 조작으로 콘텐츠 높이가 바뀌어도 앵커 기준이면 구도가 유지되고,
     * 여백을 프레임마다 조금씩 줄이면 같은 상태의 프레임끼리도 화면이 이어져 흐른다.
     */
    if (spec.anchor) {
      const ratio = plan.length > 1 ? index / (plan.length - 1) : 0;
      const margin = spec.pan
        ? Math.round(spec.pan.from + (spec.pan.to - spec.pan.from) * ratio)
        : spec.anchorMargin;
      await anchorScroll(page, spec.anchor, margin, 70);
    }

    const buffer = await page.screenshot({ type: 'png', animations: 'allow' });
    if (index === posterIndex) posterBuffer = buffer;

    const file = path.join(outputDir, `frame-${String(index + 1).padStart(3, '0')}.webp`);
    await sharp(buffer)
      .resize({ width: OUTPUT_WIDTH })
      .webp({ quality: WEBP_QUALITY })
      .toFile(file);
    bytes += fs.statSync(file).size;
  }

  if (!posterBuffer) posterBuffer = await page.screenshot({ type: 'png' });
  await context.close();

  const posterFile = path.join(outputDir, 'poster.webp');
  await sharp(posterBuffer)
    .resize({ width: OUTPUT_WIDTH })
    .webp({ quality: Math.min(90, WEBP_QUALITY + 14) })
    .toFile(posterFile);
  bytes += fs.statSync(posterFile).size;

  return { frames: plan.length, bytes, ...uniqueFrameStats(outputDir) };
}

/**
 * 촬영 결과가 실제로 "움직이는가"를 md5 로 센다.
 * 프레임 인덱스가 바뀌어도 이미지가 같으면 화면은 정지한 것과 같으므로, 이 수치가
 * 시퀀스 품질의 1차 지표다. 중복이 몰린 위치(연속 구간)도 같이 알려 준다.
 */
function uniqueFrameStats(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((file) => /^frame-\d+\.webp$/.test(file))
    .sort();

  const seen = new Set();
  const duplicates = [];
  files.forEach((file) => {
    const digest = crypto
      .createHash('md5')
      .update(fs.readFileSync(path.join(dir, file)))
      .digest('hex');
    if (seen.has(digest)) duplicates.push(file);
    seen.add(digest);
  });

  return { total: files.length, unique: seen.size, duplicates };
}

/**
 * 블렌딩 씬(도구 화면 → 전체 도구 목록)에서 아래에서 열리며 드러날 이미지 1장.
 * 시퀀스가 아니라 정지 이미지 한 장이면 충분해 별도 경로에 저장한다.
 */
async function captureBlendImage(browser) {
  const context = await browser.newContext({
    viewport: DEFAULT_VIEWPORT,
    deviceScaleFactor: DEFAULT_SCALE,
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/ko/menu`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.addStyleTag({ content: HIDE_CHROME_CSS });
  await page.waitForSelector('main#main-content', { timeout: 30_000 });
  // 검색 카드부터 카테고리 카드까지가 한 화면에 담기도록 검색 카드 상단을 앵커로 잡는다.
  await anchorScroll(page, 'text=서비스 검색', 28);
  await sleep(700);

  const buffer = await page.screenshot({ type: 'png' });
  await context.close();

  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  const file = path.join(OUTPUT_ROOT, 'blend.webp');
  await sharp(buffer)
    .resize({ width: OUTPUT_WIDTH })
    .webp({ quality: WEBP_QUALITY + 10 })
    .toFile(file);
  return fs.statSync(file).size;
}

async function main() {
  const requested = (process.env.TOOLS || Object.keys(TOOLS).join(','))
    .split(',')
    .map((s) => s.trim());

  const response = await fetch(BASE_URL).catch(() => null);
  if (!response) {
    throw new Error(
      `개발 서버에 접속할 수 없습니다: ${BASE_URL} (먼저 \`yarn dev\` 를 실행하세요)`,
    );
  }

  const browser = await chromium.launch({ headless: !HEADED });
  let totalBytes = 0;
  const results = [];

  try {
    for (const name of requested) {
      const spec = TOOLS[name];
      if (!spec) throw new Error(`알 수 없는 도구: ${name} (${Object.keys(TOOLS).join(', ')})`);

      process.stdout.write(`▶ ${name} 촬영 중… `);
      const result = await captureTool(browser, name, spec);
      totalBytes += result.bytes;
      results.push({ name, ...result });
      console.log(
        `${result.frames} 프레임 + 포스터 / ${(result.bytes / 1024 / 1024).toFixed(2)} MB`,
      );
    }
    process.stdout.write('▶ blend(도구 목록) 촬영 중… ');
    const blendBytes = await captureBlendImage(browser);
    totalBytes += blendBytes;
    console.log(`1 장 / ${(blendBytes / 1024).toFixed(0)} KB`);
  } finally {
    await browser.close();
  }

  console.log('\n─ 고유 프레임 검사(md5) ──────────────────────────────────');
  const failures = results.filter((r) => r.unique / r.total < UNIQUE_RATIO_MIN);
  results.forEach((r) => {
    const ratio = r.unique / r.total;
    const mark = ratio < UNIQUE_RATIO_MIN ? '✖ 실패' : '✔ 통과';
    console.log(
      `${mark}  ${r.name.padEnd(8)} 고유 ${String(r.unique).padStart(3)}/${r.total} (${(ratio * 100).toFixed(0)}%)` +
        (r.duplicates.length ? `  중복: ${r.duplicates.join(', ')}` : ''),
    );
  });

  console.log(`\n총 용량: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(
    `프레임 수를 바꿨다면 src/assets/datas/landingSequences.ts 의 frameCount 를 맞추세요.`,
  );

  if (failures.length) {
    throw new Error(
      `고유 프레임 비율 미달(기준 ${(UNIQUE_RATIO_MIN * 100).toFixed(0)}%): ` +
        failures.map((r) => `${r.name} ${r.unique}/${r.total}`).join(', '),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
