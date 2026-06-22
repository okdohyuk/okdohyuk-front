/**
 * solve/ClozeBlock 표현 컴포넌트 테스트.
 *
 * 템플릿을 parseCloze 로 분해해 빈칸별 input 을 렌더하고, 입력→제출 활성화,
 * 채점 후 blankResults 의 빈칸별 정/오 표시 + 오답 칸 정답 노출을 검증한다.
 * 컴포넌트는 정답을 모른다 — graded 결과는 props(서버 결과)로만 들어온다.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClozeBlock } from '../ClozeBlock';

const TEMPLATE = 'System.out.{{m}}(x); return {{v}};';

describe('<ClozeBlock /> (미채점)', () => {
  it('템플릿의 빈칸 수만큼 input 을 렌더한다', () => {
    render(<ClozeBlock clozeTemplate={TEMPLATE} />);
    expect(screen.getByLabelText('빈칸 m')).toBeInTheDocument();
    expect(screen.getByLabelText('빈칸 v')).toBeInTheDocument();
  });

  it('입력이 모두 비어 있으면 제출 버튼이 비활성', () => {
    render(<ClozeBlock clozeTemplate={TEMPLATE} />);
    expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
  });

  it('빈칸을 채우면 제출이 활성화되고 onSubmit 이 blanks 배열로 호출된다', async () => {
    const onSubmit = vi.fn();
    render(<ClozeBlock clozeTemplate={TEMPLATE} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('빈칸 m'), 'println');
    const submit = screen.getByRole('button', { name: '제출' });
    expect(submit).toBeEnabled();
    await userEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith([{ blankId: 'm', value: 'println' }]);
  });

  it('코드 빈칸(codeLanguage)이면 언어 칩을 노출한다', () => {
    render(<ClozeBlock clozeTemplate={TEMPLATE} codeLanguage="java" />);
    expect(screen.getByText('java')).toBeInTheDocument();
  });
});

describe('<ClozeBlock /> (채점 후)', () => {
  const blankResults = [
    { blankId: 'm', correct: true, correctText: 'println' },
    { blankId: 'v', correct: false, correctText: 'value' },
  ];

  it('graded 면 input 이 readOnly 이고 빈칸 라벨에 정/오 접미사가 붙는다', () => {
    render(
      <ClozeBlock
        clozeTemplate={TEMPLATE}
        graded
        submittedMap={{ m: 'println', v: 'wrong' }}
        blankResults={blankResults}
      />,
    );
    const correctInput = screen.getByLabelText('빈칸 m 정답');
    const wrongInput = screen.getByLabelText('빈칸 v 오답');
    expect(correctInput).toHaveAttribute('readonly');
    expect(wrongInput).toHaveAttribute('readonly');
    // 정/오 색 토큰
    expect(correctInput.className).toContain('bg-success-4');
    expect(wrongInput.className).toContain('bg-danger-4');
  });

  it('n/m 빈칸 정답 요약과 오답 칸의 정답을 노출한다', () => {
    render(<ClozeBlock clozeTemplate={TEMPLATE} graded blankResults={blankResults} />);
    expect(screen.getByText('1 / 2 빈칸 정답')).toBeInTheDocument();
    // 오답 칸 v 의 정답 텍스트 노출 (✕ 기호 병기)
    expect(screen.getByText(/v: value/)).toBeInTheDocument();
  });

  it('복원된 제출값(submittedMap)을 input 에 표시한다', () => {
    render(
      <ClozeBlock
        clozeTemplate={TEMPLATE}
        graded
        submittedMap={{ m: 'myPrint', v: 'myVal' }}
        blankResults={blankResults}
      />,
    );
    expect(screen.getByLabelText('빈칸 m 정답')).toHaveValue('myPrint');
    expect(screen.getByLabelText('빈칸 v 오답')).toHaveValue('myVal');
  });
});
