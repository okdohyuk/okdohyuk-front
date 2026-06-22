/**
 * solve/ChoiceButton 표현 컴포넌트 테스트.
 *
 * 컴포넌트는 정답을 모른다 — 부모가 서버 결과로 계산한 state 를 받아 시각/접근성만 반영한다.
 * 상태→variant 클래스, locked 시 onSelect 차단/aria, 키보드 트리거(click) 를 검증한다.
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChoiceButton } from '../ChoiceButton';

describe('<ChoiceButton />', () => {
  it('번호 배지와 본문, 접근성 라벨을 렌더한다', () => {
    render(<ChoiceButton index={1} text="첫 번째 보기" />);
    const btn = screen.getByRole('button', { name: '1번 보기. 첫 번째 보기' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('①');
    expect(btn).toHaveTextContent('첫 번째 보기');
  });

  it('미선택 default 는 aria-pressed=false', () => {
    render(<ChoiceButton index={2} text="t" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('selected/correct/wrong 상태는 aria-pressed=true', () => {
    const { rerender } = render(<ChoiceButton index={2} text="t" state="selected" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    rerender(<ChoiceButton index={2} text="t" state="correct" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    rerender(<ChoiceButton index={2} text="t" state="wrong" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('state 별로 다른 variant 클래스를 적용한다(정/오 색 토큰)', () => {
    const { rerender } = render(<ChoiceButton index={3} text="t" state="correct" />);
    expect(screen.getByRole('button').className).toContain('bg-success-4');
    rerender(<ChoiceButton index={3} text="t" state="wrong" />);
    expect(screen.getByRole('button').className).toContain('bg-danger-4');
    rerender(<ChoiceButton index={3} text="t" state="dimmed" />);
    expect(screen.getByRole('button').className).toContain('opacity-45');
  });

  it('클릭하면 onSelect 가 자신의 index 로 호출된다', async () => {
    const onSelect = vi.fn();
    render(<ChoiceButton index={4} text="t" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(4);
  });

  it('locked 면 클릭해도 onSelect 가 호출되지 않고 aria-disabled 가 붙는다', async () => {
    const onSelect = vi.fn();
    render(<ChoiceButton index={1} text="t" locked onSelect={onSelect} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
