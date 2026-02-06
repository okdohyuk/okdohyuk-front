import React from 'react';
import { render, screen } from '@testing-library/react';
import Link from '../index';

describe('<Link />', () => {
  it('renders with default target _self', () => {
    render(<Link href="/menu">Menu</Link>);
    const anchor = screen.getByRole('link', { name: 'Menu' });

    expect(anchor).toHaveAttribute('target', '_self');
  });

  it('renders with target _blank when hasTargetBlank is true', () => {
    render(
      <Link href="https://example.com" hasTargetBlank>
        External
      </Link>,
    );
    const anchor = screen.getByRole('link', { name: 'External' });

    expect(anchor).toHaveAttribute('target', '_blank');
  });
});
