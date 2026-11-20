import React from 'react';
import { render, screen } from '@testing-library/react';
import CursorGlowCard from '../CursorGlowCard';

describe('<CursorGlowCard />', () => {
  it('renders children inside a quiet wrapper without a cursor glow layer', () => {
    const { container } = render(
      <CursorGlowCard className="custom-card">
        <div>Glow Content</div>
      </CursorGlowCard>,
    );

    const root = container.firstElementChild as HTMLDivElement;
    expect(root).toHaveClass('custom-card');
    expect(root.querySelector('[aria-hidden]')).toBeNull();
    expect(screen.getByText('Glow Content')).toBeInTheDocument();
  });
});
