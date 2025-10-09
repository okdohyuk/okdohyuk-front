import React from 'react';
import { MockedFunction, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DisplaySettings from '../DisplaySettings'; // 경로 수정

// framer-motion 모킹
// vi.mock('framer-motion', () => {
//   const FakeTransition = vi.fn(({ children }) => children);
//   const FakeAnimatePresence = vi.fn(({ children }) => (
//     <FakeTransition>{children}</FakeTransition>
//   ));
//   const motion = {
//     div: vi.fn(({ children, ...props }) => <div {...props}>{children}</div>),
//     p: vi.fn(({ children, ...props }) => <p {...props}>{children}</p>),
//     // 다른 motion 컴포넌트들도 필요에 따라 추가
//   };
//   return {
//     __esModule: true,
//     motion,
//     AnimatePresence: FakeAnimatePresence,
//     // 다른 framer-motion export들도 필요에 따라 추가
//   };
// });

// useTranslation 모킹 (실제 프로젝트의 i18n 설정에 따라 조정 필요)
const mockT = vi.fn((key: string, options?: any) => {
  const translations: { [key: string]: string } = {
    showMilliseconds: '밀리초 표시',
    disclaimer: '고지 사항 1',
    disclaimer2: '고지 사항 2',
  };
  return translations[key] || options?.defaultValue || key;
}) as MockedFunction<any> & { $TFunctionBrand?: any };
mockT.$TFunctionBrand = undefined; // TFunction 타입과의 호환성을 위해 추가

describe('DisplaySettings Component', () => {
  const mockSetShowMilliseconds = vi.fn();

  beforeEach(() => {
    mockSetShowMilliseconds.mockClear();
    mockT.mockClear();
  });

  it('renders correctly with initial props', () => {
    render(
      <DisplaySettings
        showMilliseconds={true}
        setShowMilliseconds={mockSetShowMilliseconds}
        t={mockT}
      />,
    );

    expect(screen.getByLabelText('밀리초 표시')).toBeInTheDocument();
    expect(screen.getByLabelText('밀리초 표시')).toBeChecked();
    expect(screen.getByText('고지 사항 1')).toBeInTheDocument();
    expect(screen.getByText('고지 사항 2')).toBeInTheDocument();
  });

  it('calls setShowMilliseconds with false when checkbox is clicked (initially true)', () => {
    render(
      <DisplaySettings
        showMilliseconds={true}
        setShowMilliseconds={mockSetShowMilliseconds}
        t={mockT}
      />,
    );

    const checkbox = screen.getByLabelText('밀리초 표시');
    fireEvent.click(checkbox);
    expect(mockSetShowMilliseconds).toHaveBeenCalledTimes(1);
    expect(mockSetShowMilliseconds).toHaveBeenCalledWith(false);
  });

  it('calls setShowMilliseconds with true when checkbox is clicked (initially false)', () => {
    render(
      <DisplaySettings
        showMilliseconds={false}
        setShowMilliseconds={mockSetShowMilliseconds}
        t={mockT}
      />,
    );

    const checkbox = screen.getByLabelText('밀리초 표시');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(mockSetShowMilliseconds).toHaveBeenCalledTimes(1);
    expect(mockSetShowMilliseconds).toHaveBeenCalledWith(true);
  });

  it('renders disclaimer texts correctly', () => {
    render(
      <DisplaySettings
        showMilliseconds={true}
        setShowMilliseconds={mockSetShowMilliseconds}
        t={mockT}
      />,
    );
    expect(mockT).toHaveBeenCalledWith('showMilliseconds');
    expect(mockT).toHaveBeenCalledWith('disclaimer');
    expect(mockT).toHaveBeenCalledWith('disclaimer2');
  });
});
