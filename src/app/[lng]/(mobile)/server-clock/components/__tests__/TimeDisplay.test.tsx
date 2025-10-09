import React from 'react';
import { MockedFunction, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { TFunction } from 'i18next';
import { TargetAndTransition } from 'framer-motion';
import TimeDisplay, { TimeDisplayProps } from '../TimeDisplay';

// framer-motion 모킹
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
        <div {...props} ref={ref} />
      )),
      p: React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
        (props, ref) => <p {...props} ref={ref} />,
      ),
      h1: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
        (props, ref) => <h1 {...props} ref={ref} />,
      ),
      span: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
        (props, ref) => <span {...props} ref={ref} />,
      ),
    },
  };
});

// useTranslation 모킹
const mockT = vi.fn((key: string, options?: { [key: string]: string | number }) => {
  const translations: { [key: string]: string } = {
    loading: '서버 시간 불러오는 중...',
    'error-occurred': '오류 발생: {{error}}',
    'time-display-title': '{{site}} 서버 시간',
  };
  let translation = translations[key] || key;
  if (options?.site) {
    translation = translation.replace('{{site}}', String(options.site));
  }
  return translation;
}) as unknown as MockedFunction<TFunction<'server-clock'>>;

describe('TimeDisplay Component', () => {
  const mockGetHostname = vi.fn((url: string | undefined) =>
    url ? new URL(url).hostname : '',
  );

  beforeEach(() => {
    mockT.mockClear();
    mockGetHostname.mockClear();
  });

  const defaultProps: TimeDisplayProps = {
    isLoading: false,
    error: null,
    serverTime: new Date(),
    selectedSite: '인터파크 티켓',
    customServerUrl: '',
    getHostname: mockGetHostname,
    urgentStyle: {},
    showMilliseconds: true,
    t: mockT,
  };

  it('shows loading message when isLoading is true', () => {
    render(<TimeDisplay {...defaultProps} isLoading={true} serverTime={null} />);
    expect(screen.getByText('서버 시간 불러오는 중...')).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    const errorMessage = 'Network Error';
    render(
      <TimeDisplay {...defaultProps} error={errorMessage} isLoading={false} serverTime={null} />,
    );
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays the server time correctly with milliseconds', () => {
    const testTime = new Date();
    render(<TimeDisplay {...defaultProps} serverTime={testTime} />);

    const expectedTime = format(testTime, 'HH:mm:ss');
    const expectedMs = format(testTime, 'SSS');
    expect(screen.getByText(expectedTime)).toBeInTheDocument();
    expect(screen.getByText(`.${expectedMs}`)).toBeInTheDocument();
  });

  it('displays the server time correctly without milliseconds', () => {
    const testTime = new Date();
    render(<TimeDisplay {...defaultProps} serverTime={testTime} showMilliseconds={false} />);

    const expectedTime = format(testTime, 'HH:mm:ss');
    const expectedMs = format(testTime, 'SSS');
    expect(screen.getByText(expectedTime)).toBeInTheDocument();
    expect(screen.queryByText(`.${expectedMs}`)).not.toBeInTheDocument();
  });

  it('applies urgent style when provided', () => {
    const urgentStyleObject: TargetAndTransition = {
      color: 'rgb(239, 68, 68)',
    }; // text-red-500
    render(<TimeDisplay {...defaultProps} urgentStyle={urgentStyleObject} />);

    if (defaultProps.serverTime) {
      const timeElement = screen.getByText(format(defaultProps.serverTime, 'HH:mm:ss'));
      expect(timeElement);
    } else {
      fail('defaultProps.serverTime should not be null for this test');
    }
  });
});
