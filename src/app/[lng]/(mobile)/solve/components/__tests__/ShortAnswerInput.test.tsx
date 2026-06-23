/**
 * solve/ShortAnswerInput 표현 컴포넌트 테스트.
 *
 * 일반 단답(input, Enter 제출)과 코드 답안(code=true: monospace textarea, Enter=줄바꿈,
 * Ctrl/Cmd+Enter 또는 제출 버튼으로 제출)을 각각 검증한다. 핵심은 코드 답안에서
 * 사용자가 입력한 내부 공백·줄바꿈이 onSubmit 으로 축약 없이 그대로 전달되는 것
 * (백엔드 strict 채점 normalizeCode 와 정합). 채점은 서버가 하므로 정오 결과는 props 로만 들어온다.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShortAnswerInput } from '../ShortAnswerInput';

describe('<ShortAnswerInput /> (일반 단답, 미채점)', () => {
  it('input 을 렌더하고 빈값이면 제출 버튼이 비활성', () => {
    render(<ShortAnswerInput />);
    expect(screen.getByLabelText('단답 입력').tagName).toBe('INPUT');
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
  });

  it('입력 후 Enter 로 제출되고 onSubmit 이 값으로 호출된다', async () => {
    const onSubmit = vi.fn();
    render(<ShortAnswerInput onSubmit={onSubmit} />);
    const input = screen.getByLabelText('단답 입력');
    await userEvent.type(input, '캡슐화{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('캡슐화');
  });

  it('입력 후 제출 버튼으로도 제출된다', async () => {
    const onSubmit = vi.fn();
    render(<ShortAnswerInput onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('단답 입력'), '상속');
    await userEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(onSubmit).toHaveBeenCalledWith('상속');
  });
});

describe('<ShortAnswerInput /> (코드 답안, 미채점)', () => {
  it('code=true 면 monospace textarea 를 렌더한다(input 아님)', () => {
    render(<ShortAnswerInput code />);
    const el = screen.getByLabelText('코드 답안 입력');
    expect(el.tagName).toBe('TEXTAREA');
    expect(el.className).toContain('font-mono');
  });

  it('Enter 는 줄바꿈으로 처리되고 제출하지 않는다', async () => {
    const onSubmit = vi.fn();
    render(<ShortAnswerInput code onSubmit={onSubmit} />);
    const ta = screen.getByLabelText('코드 답안 입력') as HTMLTextAreaElement;
    await userEvent.type(ta, 'a{Enter}b');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(ta.value).toBe('a\nb');
  });

  it('내부 공백·줄바꿈을 축약 없이 그대로 onSubmit 으로 전달한다', async () => {
    const onSubmit = vi.fn();
    render(<ShortAnswerInput code onSubmit={onSubmit} />);
    const ta = screen.getByLabelText('코드 답안 입력') as HTMLTextAreaElement;
    // 들여쓰기(공백 4칸) + 줄바꿈 + 내부 다중 공백을 정확히 재현(userEvent 특수문자 이스케이프
    // 우회를 위해 change 로 raw 값을 주입). 컴포넌트가 이 값을 축약하지 않고 그대로 넘겨야 한다.
    const raw = 'for (int i = 0; i < n; i++) {\n    sum  +=  i;\n}';
    fireEvent.change(ta, { target: { value: raw } });
    expect(ta.value).toBe(raw);
    await userEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(onSubmit).toHaveBeenCalledWith(raw);
  });

  it('Ctrl+Enter 로 보조 제출된다', async () => {
    const onSubmit = vi.fn();
    render(<ShortAnswerInput code onSubmit={onSubmit} />);
    const ta = screen.getByLabelText('코드 답안 입력');
    await userEvent.type(ta, 'x = 1');
    await userEvent.keyboard('{Control>}{Enter}{/Control}');
    expect(onSubmit).toHaveBeenCalledWith('x = 1');
  });

  it('공백만 입력하면 제출 버튼이 비활성(빈 입력 가드)', async () => {
    render(<ShortAnswerInput code />);
    await userEvent.type(screen.getByLabelText('코드 답안 입력'), '   ');
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
  });
});

describe('<ShortAnswerInput /> (코드 답안, 채점 후)', () => {
  it('정답이면 제출한 답을 줄바꿈 보존(pre)으로 표시하고 success 토큰을 쓴다', () => {
    render(<ShortAnswerInput code graded isCorrect submittedText={'line1\n    line2'} />);
    const pre = screen.getByLabelText('제출한 답');
    expect(pre.tagName).toBe('PRE');
    expect(pre.className).toContain('whitespace-pre');
    expect(pre.className).toContain('border-success-2');
    expect(pre.textContent).toBe('line1\n    line2');
  });

  it('오답이면 danger 토큰 + 줄바꿈 보존된 correctText 를 노출한다', () => {
    render(
      <ShortAnswerInput
        code
        graded
        isCorrect={false}
        submittedText="wrong"
        correctText={'a\n    b'}
      />,
    );
    expect(screen.getByLabelText('제출한 답').className).toContain('border-danger-2');
    expect(screen.getByText('정답:')).toBeInTheDocument();
    // correctText 를 줄바꿈 보존(pre)으로 노출하는지 확인. 제출한 답 pre(='wrong') 와 구분해
    // correctText 를 담은 pre 를 찾는다.
    const pres = Array.from(document.querySelectorAll('pre'));
    const correctPre = pres.find((p) => p.textContent === 'a\n    b');
    expect(correctPre).toBeTruthy();
    expect(correctPre?.className).toContain('whitespace-pre');
  });
});
