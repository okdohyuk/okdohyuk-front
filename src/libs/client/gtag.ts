'use client';

import { sendGAEvent as sE } from '@next/third-parties/google';
import Cookies from 'js-cookie';
import Jwt from '@utils/jwtUtils';

// =============================================================================
// Event types
// 글로벌 / 내비 / 홈 / 블로그 / 라이브 / 메뉴 / 인증 / 도구 / UI / 기타 + 호환
// =============================================================================
type GlobalEvent =
  | 'page_view'
  | 'scroll'
  | 'web_vitals'
  | 'exception'
  | 'outbound_click'
  | 'session_start_with_user';

type NavEvent =
  | 'nav_click'
  | 'language_change'
  | 'command_palette_open'
  | 'command_palette_search'
  | 'command_palette_select'
  | 'consent_update'
  | 'share_click';

type HomeEvent =
  | 'install_app_prompt_shown'
  | 'install_app_click'
  | 'pwa_install_accepted'
  | 'pwa_install_dismissed'
  | 'landing_section_view'
  | 'hero_cta_click';

type BlogEvent =
  | 'blog_search'
  | 'blog_filter_apply'
  | 'blog_sort_change'
  | 'blog_card_click'
  | 'blog_load_more'
  | 'blog_search_no_results'
  | 'blog_view'
  | 'blog_read_25'
  | 'blog_read_50'
  | 'blog_read_75'
  | 'blog_read_90'
  | 'blog_read_complete'
  | 'blog_tag_click'
  | 'blog_toc_click'
  | 'blog_share'
  | 'blog_copy_code'
  | 'blog_image_zoom';

type LiveEvent =
  | 'live_view'
  | 'live_stream_add'
  | 'live_stream_remove'
  | 'live_layout_change'
  | 'live_share_url';

type MenuEvent = 'tool_open' | 'menu_search' | 'user_card_click';

type AuthEvent = 'login_attempt' | 'login_success' | 'login_failure' | 'logout';

type ToolEvent =
  | 'tool_input_started'
  | 'tool_use'
  | 'tool_copy_result'
  | 'tool_share_result'
  | 'todo_add'
  | 'todo_complete'
  | 'todo_delete'
  | 'todo_clear_all'
  | 'tool_session_start'
  | 'tool_session_end';

type UiEvent = 'ui_button_click' | 'ui_button_hover' | 'ui_link_click' | 'ui_link_hover';

type LegacyEvent = 'button_click' | 'link_click';

type MiscEvent = 'legal_section_jump';

export type Event =
  | GlobalEvent
  | NavEvent
  | HomeEvent
  | BlogEvent
  | LiveEvent
  | MenuEvent
  | AuthEvent
  | ToolEvent
  | UiEvent
  | MiscEvent
  | LegacyEvent;

// =============================================================================
// Page group
// =============================================================================
export type PageGroup =
  | 'home'
  | 'blog_list'
  | 'blog_detail'
  | 'tool'
  | 'auth'
  | 'legal'
  | 'live'
  | 'menu'
  | 'admin'
  | 'other';

const LANG_SEGMENT = /^\/[a-z]{2}(?=\/|$)/;

export function getPageGroup(pathname: string): PageGroup {
  if (!pathname) return 'other';
  // /{lng} 또는 /{lng}/...
  const stripped = pathname.replace(LANG_SEGMENT, '') || '/';

  if (stripped === '/') return 'home';
  if (stripped === '/blog') return 'blog_list';
  if (stripped.startsWith('/blog/')) return 'blog_detail';
  if (stripped.startsWith('/auth')) return 'auth';
  if (stripped.startsWith('/admin')) return 'admin';
  if (stripped.startsWith('/multi-live')) return 'live';
  if (stripped.startsWith('/menu')) return 'menu';
  if (stripped.startsWith('/privacy') || stripped.startsWith('/terms')) return 'legal';
  // (mobile) 그룹은 URL에 노출되지 않으므로 그 외 단일 세그먼트는 tool로 분류
  // 단, 명시 케이스가 모두 빠진 경우 한정
  // 예: /qr, /todo, /loan 등
  if (/^\/[^/]+$/.test(stripped)) return 'tool';

  return 'other';
}

function getLngFromPath(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/);
  return match ? match[1] : '';
}

// =============================================================================
// GTagEvent payload
// =============================================================================
type GTagEvent = {
  id: string;
  custom_session_id: string;
  pathname: string;
  lng: string;
  page_group: PageGroup;
  value: string;
  [key: string]: unknown;
};

type SendGAEventType = (event: Event, value: string, extraParams?: Record<string, unknown>) => void;

export const sendGAEvent: SendGAEventType = (event, value, extraParams) => {
  if (typeof window === 'undefined') return;

  const { pathname } = window.location;
  const pageGroup = getPageGroup(pathname);

  // admin 라우트는 트래킹 제외
  if (pageGroup === 'admin') return;

  let id = '';
  const accessToken = Cookies.get('access_token');

  if (accessToken) {
    try {
      const { id: userId } = Jwt.getPayload(accessToken) || {};
      id = userId ?? '';
    } catch {
      id = '';
    }
  } else {
    id = Cookies.get('SessionId') || '';
  }

  const sessionId = Cookies.get('SessionId') || '';
  const lng = getLngFromPath(pathname);

  const params: GTagEvent = {
    id,
    custom_session_id: sessionId,
    pathname,
    lng,
    page_group: pageGroup,
    value,
    ...(extraParams ?? {}),
  };

  // @next/third-parties 의 sendGAEvent 는 전달된 인자 목록을 그대로 dataLayer 에 push 한다.
  // gtag.js 가 이벤트로 인식하려면 ('event', '<이름>', { ...params }) 형태여야 한다.
  // 객체 하나만 넘기면(GTM dataLayer 컨벤션) gtag.js 가 무시하므로 커스텀 이벤트가 유실된다.
  sE('event', event, params);
};

// =============================================================================
// Consent Mode helpers (window.gtag 직접 호출)
// =============================================================================
type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: Object[];
  }
}

function gtagSafe(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
    return;
  }
  // gtag.js가 아직 로드되지 않은 경우 dataLayer로 직접 push
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args as unknown as object);
}

export function setConsentDefault() {
  gtagSafe('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });
}

export function setConsentUpdate(granted: boolean) {
  const analyticsValue = granted ? 'granted' : 'denied';
  gtagSafe('consent', 'update', {
    analytics_storage: analyticsValue,
    // 광고 목적 데이터는 동의 여부와 무관하게 항상 denied
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
}
