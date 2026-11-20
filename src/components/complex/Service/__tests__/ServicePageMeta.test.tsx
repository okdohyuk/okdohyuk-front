import React from 'react';
import { render, screen } from '@testing-library/react';
import ServicePageMeta from '../ServicePageMeta';

const pathnameMock = vi.fn(() => '/ko/percent');

vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ko' } }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

describe('<ServicePageMeta />', () => {
  it('decodes percent-encoded (Korean) slugs for display', () => {
    pathnameMock.mockReturnValue(`/ko/blog/${encodeURIComponent('리액트-훅')}`);
    render(<ServicePageMeta />);
    expect(screen.getByText('~/blog/리액트-훅')).toBeInTheDocument();
  });

  it('drops the locale segment', () => {
    pathnameMock.mockReturnValue('/en/percent');
    render(<ServicePageMeta />);
    expect(screen.getByText('~/percent')).toBeInTheDocument();
  });

  it('keeps paths without a locale segment', () => {
    pathnameMock.mockReturnValue('/l/abc');
    render(<ServicePageMeta />);
    expect(screen.getByText('~/l/abc')).toBeInTheDocument();
  });

  it('falls back to the raw path when the encoding is malformed', () => {
    pathnameMock.mockReturnValue('/ko/blog/%E0%A4%A');
    render(<ServicePageMeta />);
    expect(screen.getByText('~/blog/%E0%A4%A')).toBeInTheDocument();
  });
});
