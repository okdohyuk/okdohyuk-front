import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShortUrlAdminPageImpl from '../impl';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
  refetch: vi.fn(),
  createHook: vi.fn(),
  deleteHook: vi.fn(),
}));

vi.mock('@queries/useShortUrlQueries', () => ({
  useShortUrlBannedDomains: mocks.list,
  useCreateShortUrlBannedDomain: mocks.createHook,
  useDeleteShortUrlBannedDomain: mocks.deleteHook,
}));
vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@utils/errorHandler', () => ({ getErrorMessage: () => '등록 실패' }));

const domain = { id: 7, domain: 'example.com', createdAt: '2026-09-07T12:00:00' };

describe('Short URL admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockReturnValue({
      data: [domain],
      isLoading: false,
      isError: false,
      refetch: mocks.refetch,
    });
    mocks.createHook.mockReturnValue({ mutate: mocks.create, isPending: false });
    mocks.deleteHook.mockReturnValue({ mutate: mocks.remove, isPending: false });
  });

  it('renders domains and refreshes the list', async () => {
    render(<ShortUrlAdminPageImpl lng="ko" />);
    expect(screen.getByRole('cell', { name: 'example.com' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '새로고침' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it('submits an IDN domain for server validation and clears on success', async () => {
    mocks.create.mockImplementation((_input, callbacks) => callbacks.onSuccess());
    render(<ShortUrlAdminPageImpl lng="ko" />);
    const input = screen.getByRole('textbox', { name: '차단할 도메인' });
    fireEvent.change(input, { target: { value: ' 도메인.EXAMPLE. ' } });
    await userEvent.click(screen.getByRole('button', { name: '차단 등록' }));
    expect(mocks.create).toHaveBeenCalledWith({ domain: '도메인.example.' }, expect.any(Object));
    expect(input).toHaveValue('');
  });

  it('does not submit an empty domain', () => {
    render(<ShortUrlAdminPageImpl lng="ko" />);
    expect(screen.getByRole('button', { name: '차단 등록' })).toBeDisabled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('requires confirmation before removing a ban', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ShortUrlAdminPageImpl lng="ko" />);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(mocks.remove).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(mocks.remove).toHaveBeenCalledWith(7, expect.any(Object));
    confirm.mockRestore();
  });

  it('keeps the input and displays a failed registration', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    mocks.create.mockImplementation((_input, callbacks) =>
      callbacks.onError(new Error('conflict')),
    );
    render(<ShortUrlAdminPageImpl lng="ko" />);
    const input = screen.getByRole('textbox', { name: '차단할 도메인' });
    fireEvent.change(input, { target: { value: 'example.com' } });
    await userEvent.click(screen.getByRole('button', { name: '차단 등록' }));
    expect(alert).toHaveBeenCalledWith('등록 실패');
    expect(input).toHaveValue('example.com');
    alert.mockRestore();
  });

  it.each([
    [{ isLoading: true, isError: false }, '차단 도메인 목록을 불러오는 중입니다...'],
    [{ isLoading: false, isError: true }, '차단 도메인 목록을 불러오지 못했습니다.'],
    [{ isLoading: false, isError: false }, '등록된 차단 도메인이 없습니다.'],
  ])('renders the query state %j', (state, message) => {
    mocks.list.mockReturnValue({ ...state, data: [], refetch: mocks.refetch });
    render(<ShortUrlAdminPageImpl lng="ko" />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('disables mutation controls while requests are pending', () => {
    mocks.createHook.mockReturnValue({ mutate: mocks.create, isPending: true });
    mocks.deleteHook.mockReturnValue({ mutate: mocks.remove, isPending: true });
    render(<ShortUrlAdminPageImpl lng="ko" />);
    expect(screen.getByRole('textbox', { name: '차단할 도메인' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '등록 중...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
  });
});
