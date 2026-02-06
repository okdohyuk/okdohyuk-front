import React from 'react';
import { render, screen } from '@testing-library/react';
import ServicePageHeader from '../ServicePageHeader';

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
});
