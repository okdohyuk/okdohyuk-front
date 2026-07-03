/**
 * GuestbookForm: 클라이언트 폼 컴포넌트 단위 테스트.
 * useCreateGuestbook 훅 / UserTokenUtil / i18n 을 mock 해 로그인 여부에 따른 필드 노출,
 * 검증 분기, mutate 호출 payload(trim 포함) 흐름만 검증한다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import UserTokenUtil from '@utils/userTokenUtil';
import GuestbookForm from '../GuestbookForm';

// mock 은 hoist 되므로 import 후 참조한다.

// useCreateGuestbook 훅 모킹 — mutate 만 spy 로 노출한다.
const mutateMock = vi.fn();
const useCreateGuestbookMock = vi.fn();

vi.mock('@queries/useGuestbookQueries', () => ({
  useCreateGuestbook: () => useCreateGuestbookMock(),
}));

// UserTokenUtil 모킹 — getAccessToken 반환값으로 로그인 여부를 제어한다.
vi.mock('@utils/userTokenUtil', () => ({
  default: {
    getAccessToken: vi.fn(),
  },
}));

// i18n 훅 mock — 키를 라벨로 매핑. ns(guestbook/common) 은 무시하고 동일 매핑을 사용한다.
const I18N_LABELS: Record<string, string> = {
  'form.nickname': '닉네임',
  'form.nicknamePlaceholder': '닉네임 입력',
  'form.password': '삭제 비밀번호',
  'form.passwordPlaceholder': '비밀번호 입력',
  'form.content': '내용',
  placeholder: '방명록을 남겨보세요',
  'form.loginNotice': '로그인 상태로 작성됩니다',
  'form.anonymousNotice': '익명으로 작성됩니다',
  'form.submit': '남기기',
  'form.submitting': '작성 중…',
  'validation.contentRequired': '내용을 입력해 주세요.',
  'validation.nicknameRequired': '닉네임을 입력해 주세요.',
  'validation.passwordRequired': '삭제 비밀번호를 입력해 주세요.',
};

vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => I18N_LABELS[key] ?? key,
    i18n: { language: 'ko' },
  }),
}));

const getAccessTokenMock = UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>;

function setMutationState(state: { isPending?: boolean } = {}) {
  useCreateGuestbookMock.mockReturnValue({
    mutate: mutateMock,
    isPending: state.isPending ?? false,
  });
}

const onSuccess = vi.fn();

function renderForm() {
  return render(<GuestbookForm lng="ko" onSuccess={onSuccess} />);
}

describe('<GuestbookForm lng="ko" />', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    useCreateGuestbookMock.mockReset();
    onSuccess.mockReset();
    getAccessTokenMock.mockReset();
    // 기본: 비로그인
    getAccessTokenMock.mockReturnValue(null);
    setMutationState();
  });

  describe('비로그인 상태', () => {
    it('닉네임/비밀번호 필드와 내용/제출 버튼이 노출된다', () => {
      renderForm();
      expect(screen.getByLabelText('닉네임')).toBeInTheDocument();
      expect(screen.getByLabelText('삭제 비밀번호')).toBeInTheDocument();
      expect(screen.getByLabelText('내용')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '남기기' })).toBeInTheDocument();
    });

    it('빈 content 로 제출하면 내용 검증 에러가 노출되고 mutate 가 호출되지 않는다', () => {
      const { container } = renderForm();

      // content 가 비어 있으면 제출 버튼은 disabled 이므로 form submit 이벤트로 핸들러를 직접 exercise 한다.
      const form = container.querySelector('form');
      expect(form).not.toBeNull();
      fireEvent.submit(form!);

      expect(screen.getByText('내용을 입력해 주세요.')).toBeInTheDocument();
      expect(mutateMock).not.toHaveBeenCalled();
    });

    it('닉네임 누락 시 닉네임 검증 에러가 노출되고 mutate 가 호출되지 않는다', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText('내용'), '내용은 있어요');
      await user.click(screen.getByRole('button', { name: '남기기' }));

      expect(screen.getByText('닉네임을 입력해 주세요.')).toBeInTheDocument();
      expect(mutateMock).not.toHaveBeenCalled();
    });

    it('삭제 비밀번호 누락 시 비밀번호 검증 에러가 노출되고 mutate 가 호출되지 않는다', async () => {
      const user = userEvent.setup();
      renderForm();

      await user.type(screen.getByLabelText('내용'), '내용은 있어요');
      await user.type(screen.getByLabelText('닉네임'), '테스터');
      await user.click(screen.getByRole('button', { name: '남기기' }));

      expect(screen.getByText('삭제 비밀번호를 입력해 주세요.')).toBeInTheDocument();
      expect(mutateMock).not.toHaveBeenCalled();
    });

    it('정상 입력 시 mutate 가 {content(trim), nickname(trim), deletePassword} payload 로 호출된다', async () => {
      const user = userEvent.setup();
      renderForm();

      // content 는 앞뒤 공백 포함 → trim 검증
      await user.type(screen.getByLabelText('내용'), '  안녕하세요 방명록  ');
      await user.type(screen.getByLabelText('닉네임'), '테스터');
      await user.type(screen.getByLabelText('삭제 비밀번호'), 'secret123');
      await user.click(screen.getByRole('button', { name: '남기기' }));

      expect(mutateMock).toHaveBeenCalledTimes(1);
      expect(mutateMock.mock.calls[0][0]).toEqual({
        content: '안녕하세요 방명록',
        nickname: '테스터',
        deletePassword: 'secret123',
      });
    });
  });

  describe('로그인 상태', () => {
    beforeEach(() => {
      getAccessTokenMock.mockReturnValue('tok-logged-in');
    });

    it('닉네임/비밀번호 필드는 숨겨지고 content 만으로 mutate 가 호출된다', async () => {
      const user = userEvent.setup();
      renderForm();

      // 로그인 판별은 useEffect 에서 getAccessToken 으로 이뤄지며, 필드가 숨겨져야 한다.
      expect(screen.queryByLabelText('닉네임')).toBeNull();
      expect(screen.queryByLabelText('삭제 비밀번호')).toBeNull();

      await user.type(screen.getByLabelText('내용'), '로그인 사용자의 글');
      await user.click(screen.getByRole('button', { name: '남기기' }));

      expect(mutateMock).toHaveBeenCalledTimes(1);
      expect(mutateMock.mock.calls[0][0]).toEqual({ content: '로그인 사용자의 글' });
    });
  });
});
