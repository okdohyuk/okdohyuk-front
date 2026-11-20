import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { OPEN_COMMAND_PALETTE_EVENT } from '@utils/commandPalette';
import ServicePageHeader from '../ServicePageHeader';

vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ko' },
  }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/ko/percent',
}));

describe('<ServicePageHeader />', () => {
  it('renders title, badge and description', () => {
    render(
      <ServicePageHeader title="Dashboard" badge="Admin Console" description="Manage resources" />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Admin Console')).toBeInTheDocument();
    expect(screen.getByText('Manage resources')).toBeInTheDocument();
  });

  it('renders only title when optional fields are missing', () => {
    render(<ServicePageHeader title="Simple Header" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Simple Header' })).toBeInTheDocument();
  });

  it('shows the mono path signature for the current route', () => {
    render(<ServicePageHeader title="Percent" />);
    expect(screen.getByText('~/percent')).toBeInTheDocument();
  });

  it('opens the command palette from the keycap button', () => {
    const listener = vi.fn();
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, listener);

    render(<ServicePageHeader title="Percent" />);
    fireEvent.click(screen.getByRole('button', { name: 'navigation.openSearch' }));

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, listener);
  });
});
