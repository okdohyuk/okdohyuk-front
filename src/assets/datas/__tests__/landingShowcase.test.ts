import { describe, expect, it } from 'vitest';
import { isStandaloneTool, menus } from '@assets/datas/menus';
import { SERVICE_TOOL_COUNT, SERVICE_TOOL_COUNT_BY_SECTION } from '@assets/datas/landingShowcase';

const NON_TOOL_LINKS = ['/pokemon', '/guestbook'];

describe('SERVICE_TOOL_COUNT', () => {
  it('counts standalone tools only (hub and guestbook excluded)', () => {
    const counted = menus.service.filter(isStandaloneTool).map((item) => item.link);
    NON_TOOL_LINKS.forEach((link) => expect(counted).not.toContain(link));
    expect(SERVICE_TOOL_COUNT).toBe(menus.service.length - NON_TOOL_LINKS.length);
  });

  it('matches the per-section totals', () => {
    const sum = Object.values(SERVICE_TOOL_COUNT_BY_SECTION).reduce((a, b) => a + b, 0);
    expect(sum).toBe(SERVICE_TOOL_COUNT);
  });
});
