/**
 * ShortenerForm: 클라이언트 폼 컴포넌트 단위 테스트.
 * useShortUrlQueries 훅과 logger 를 mock 해 폼 입력/검증/제출/결과 카드 표시 흐름만 검증한다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShortenerForm from '../ShortenerForm';

// useShortUrlQueries 훅 모킹
const mutateMock = vi.fn();
const useCreateShortUrlMock = vi.fn();

vi.mock('@queries/useShortUrlQueries', () => ({
  useCreateShortUrl: () => useCreateShortUrlMock(),
}));

vi.mock('@utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

// i18n 훅 mock — 키를 그대로 반환. 컴포넌트가 SSR/CSR 동기화 없이 즉시 렌더되도록.
const I18N_LABELS: Record<string, string> = {
  'form.originalUrl.label': '원본 URL',
  'form.originalUrl.placeholder': 'https://example.com/very/long/path',
  'form.originalUrl.helper': 'http:// 또는 https:// 로 시작하는 전체 URL 을 입력해 주세요.',
  'form.originalUrl.errorRequired': '단축할 URL 을 입력해 주세요.',
  'form.originalUrl.errorInvalid': 'http:// 또는 https:// 로 시작하는 URL 만 입력할 수 있어요.',
  'form.expirePreset.label': '사용 기간',
  'form.expirePreset.ariaLabel': '단축 URL 만료 기간 선택',
  'form.expirePreset.options.oneDay': '1일',
  'form.expirePreset.options.sevenDays': '7일',
  'form.expirePreset.options.thirtyDays': '30일 (기본)',
  'form.expirePreset.options.oneYear': '1년',
  'form.expirePreset.options.never': '무제한',
  'form.submit': '단축하기',
  'form.submitting': '생성 중…',
  'form.apiError': '단축 URL 생성에 실패했어요. 잠시 후 다시 시도해 주세요.',
  'result.title': '단축 URL 결과',
  'result.code': '코드',
  'result.hitCount': '클릭 수',
  'result.expires': '만료',
  'result.expiresNever': '무제한',
  'result.copy': '복사',
  'result.copied': '복사됨',
  'result.original': '원본',
};

vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => I18N_LABELS[key] ?? key,
    i18n: { language: 'ko' },
  }),
}));

function setMutationState(state: { data?: unknown; isPending?: boolean; isError?: boolean }) {
  useCreateShortUrlMock.mockReturnValue({
    mutate: mutateMock,
    data: state.data,
    isPending: state.isPending ?? false,
    isError: state.isError ?? false,
  });
}

const sampleShortUrl = {
  code: 'aB3xY9',
  shortUrl: 'https://okdohyuk.dev/l/aB3xY9',
  originalUrl: 'https://example.com/very/long/path',
  expiresAt: '2026-06-01T00:00:00',
  hitCount: 0,
  createdAt: '2026-05-15T10:00:00',
};

describe('<ShortenerForm lng="ko" />', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    useCreateShortUrlMock.mockReset();
    setMutationState({ data: undefined });
  });

  it('초기 상태에서 폼이 렌더된다 (원본 URL 입력 + 단축하기 버튼)', () => {
    render(<ShortenerForm lng="ko" />);
    expect(screen.getByRole('textbox', { name: /원본 URL/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '단축하기' })).toBeInTheDocument();
  });

  it('빈 URL 로 제출하면 검증 에러 메시지가 노출되고 mutate 가 호출되지 않는다', async () => {
    const user = userEvent.setup();
    render(<ShortenerForm lng="ko" />);

    await user.click(screen.getByRole('button', { name: '단축하기' }));

    expect(screen.getByRole('alert')).toHaveTextContent('단축할 URL 을 입력해 주세요.');
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('ftp:// 등 http(s) 가 아닌 URL 입력 시 검증 에러를 노출한다', async () => {
    const user = userEvent.setup();
    render(<ShortenerForm lng="ko" />);

    const input = screen.getByRole('textbox', { name: /원본 URL/ });
    await user.type(input, 'ftp://example.com/file');
    await user.click(screen.getByRole('button', { name: '단축하기' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/http:\/\/ 또는 https:\/\//);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('정상 https URL 입력 시 mutate 가 trimmed payload 로 호출된다 (기본 expirePreset=THIRTY_DAYS)', async () => {
    const user = userEvent.setup();
    render(<ShortenerForm lng="ko" />);

    const input = screen.getByRole('textbox', { name: /원본 URL/ });
    // 앞뒤 공백 포함 입력 — trim 검증
    await user.type(input, '  https://example.com/very/long/path  ');
    await user.click(screen.getByRole('button', { name: '단축하기' }));

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith({
      originalUrl: 'https://example.com/very/long/path',
      expirePreset: 'THIRTY_DAYS',
    });
  });

  it('mutation 성공 결과(data)가 있으면 결과 카드를 렌더한다 (shortUrl, code, hitCount)', () => {
    setMutationState({ data: sampleShortUrl });
    render(<ShortenerForm lng="ko" />);

    // shortUrl 링크 (a 태그)
    const link = screen.getByRole('link', { name: 'https://okdohyuk.dev/l/aB3xY9' });
    expect(link).toHaveAttribute('href', 'https://okdohyuk.dev/l/aB3xY9');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));

    // 코드, hitCount, 원본 URL 노출
    expect(screen.getByText('aB3xY9')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // hitCount
    expect(screen.getByText(/원본: https:\/\/example.com\/very\/long\/path/)).toBeInTheDocument();

    // 복사 버튼 노출
    expect(screen.getByRole('button', { name: /복사/ })).toBeInTheDocument();
  });

  it('mutation isPending 일 때 단축하기 버튼은 disabled + "생성 중…" 표시', () => {
    setMutationState({ isPending: true });
    render(<ShortenerForm lng="ko" />);

    const submitButton = screen.getByRole('button', { name: /생성 중/ });
    expect(submitButton).toBeDisabled();
  });

  it('mutation isError 일 때 에러 메시지를 alert role 로 노출한다', () => {
    setMutationState({ isError: true });
    render(<ShortenerForm lng="ko" />);

    // alert role 중 에러 메시지 포함된 요소 검색
    const alerts = screen.getAllByRole('alert');
    expect(alerts.some((el) => /단축 URL 생성에 실패/.test(el.textContent ?? ''))).toBe(true);
  });

  it('복사 버튼 클릭 시 navigator.clipboard.writeText 가 shortUrl 로 호출된다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    // jsdom 의 navigator.clipboard 는 readonly getter — defineProperty 로 덮어쓴다.
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    setMutationState({ data: sampleShortUrl });

    render(<ShortenerForm lng="ko" />);

    // 결과 카드 영역의 복사 버튼만 선택 (form 의 단축하기 버튼과 분리)
    const buttons = screen.getAllByRole('button');
    const copyButton = buttons.find((b) => /복사$/.test(b.textContent ?? ''));
    expect(copyButton, '복사 버튼이 존재해야 한다').toBeDefined();
    // fireEvent.click 으로 직접 클릭 (userEvent 의 비동기 처리 이슈 회피)
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.click(copyButton!);
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://okdohyuk.dev/l/aB3xY9');
    });
  });
});
