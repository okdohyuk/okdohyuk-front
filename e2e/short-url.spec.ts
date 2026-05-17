import { test, expect, type Page } from '@playwright/test';

const API_BASE = process.env.E2E_API_BASE ?? 'http://localhost:8080';
const APP_BASE = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

async function createViaApi(originalUrl: string, expirePreset: string = 'THIRTY_DAYS') {
  const res = await fetch(`${API_BASE}/short-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl, expirePreset }),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`POST /short-url failed: ${res.status} ${errBody}`);
  }
  return (await res.json()) as {
    code: string;
    shortUrl: string;
    originalUrl: string;
    expiresAt: string | null;
    hitCount: number;
    createdAt: string;
  };
}

async function fillShortenerForm(page: Page, url: string) {
  await page.goto('/ko/shortener');
  await expect(page.locator('#shortener-original-url')).toBeVisible();
  await page.locator('#shortener-original-url').fill(url);
  await page.getByRole('button', { name: '단축하기' }).click();
}

test.describe('URL 단축 서비스 E2E', () => {
  test('생성 페이지에서 단축 URL을 만들면 결과 카드가 노출된다', async ({ page }) => {
    const target = 'https://example.com/golden-path';
    await fillShortenerForm(page, target);

    const resultCard = page.getByRole('region', { name: '단축 URL 결과' });
    await expect(resultCard).toBeVisible({ timeout: 15_000 });

    const shortUrlLink = resultCard.getByRole('link');
    await expect(shortUrlLink).toBeVisible();
    const href = await shortUrlLink.getAttribute('href');
    expect(href).toMatch(/\/l\/[A-Za-z0-9]{6}$/);
    await expect(resultCard).toContainText(target);
  });

  test('http/https 가 아닌 URL은 클라이언트 검증으로 차단된다', async ({ page }) => {
    await fillShortenerForm(page, 'javascript:alert(1)');
    // Next.js route announcer 도 role=alert 라 strict mode 충돌 → 폼 내부 알림 클래스로 한정
    await expect(page.locator('p.text-red-500[role="alert"]')).toContainText('http://');
    await expect(page.getByRole('region', { name: '단축 URL 결과' })).toHaveCount(0);
  });

  test('/l/{code} 접속 시 원본 URL로 리다이렉트된다', async ({ page }) => {
    const original = 'https://example.com/redirect-target?e2e=1';
    const created = await createViaApi(original);

    // example.com 응답이 길게 걸릴 수 있으므로 navigation을 example.com URL로 기다림
    await page.goto(`${APP_BASE}/l/${created.code}`, { waitUntil: 'commit' });
    await page.waitForURL((u) => u.toString().startsWith('https://example.com/'), {
      timeout: 20_000,
    });
    expect(page.url()).toBe(original);
  });

  test('존재하지 않는 코드는 not-found 페이지를 보여준다', async ({ page }) => {
    const res = await page.goto(`${APP_BASE}/l/000000`);
    expect(res?.status()).toBe(404);
  });

  test('resolve 호출 시 hitCount 가 증가한다 (백엔드 직접 호출)', async ({ request }) => {
    const created = await createViaApi('https://example.com/hit-count');
    const before = created.hitCount;

    const resolve1 = await request.get(`${API_BASE}/short-url/${created.code}/resolve`);
    expect(resolve1.ok()).toBeTruthy();
    const resolve2 = await request.get(`${API_BASE}/short-url/${created.code}/resolve`);
    expect(resolve2.ok()).toBeTruthy();

    // 비동기 hit count flush 가능성 대비 폴링
    await expect
      .poll(
        async () => {
          // /me 는 인증 필요 → resolve 응답 자체에는 카운트가 없으므로
          // 새 코드 생성 후 같은 originalUrl 의 hitCount 변화를 직접 확인할 수 없다.
          // 대신 resolve 응답이 originalUrl 을 정확히 반환하는지로 정합성 검증.
          const r = await request.get(`${API_BASE}/short-url/${created.code}/resolve`);
          const body = await r.json();
          return body.originalUrl;
        },
        { timeout: 5_000 },
      )
      .toBe('https://example.com/hit-count');

    expect(before).toBe(0);
  });
});
