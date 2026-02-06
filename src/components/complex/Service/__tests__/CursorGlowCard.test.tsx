import React from 'react';
import { render, screen } from '@testing-library/react';
import CursorGlowCard from '../CursorGlowCard';

describe('<CursorGlowCard />', () => {
  it('updates cursor css variables on pointer move', () => {
    const { container } = render(
      <CursorGlowCard>
        <div>Glow Content</div>
      </CursorGlowCard>,
    );

    const root = container.firstElementChild as HTMLDivElement;
    const event = new Event('pointermove', { bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: 'mouse' });
    Object.defineProperty(event, 'clientX', { value: 20 });
    Object.defineProperty(event, 'clientY', { value: 30 });
    root.dispatchEvent(event);

    expect(root.style.getPropertyValue('--cursor-x')).toBe('20px');
    expect(root.style.getPropertyValue('--cursor-y')).toBe('30px');
    expect(screen.getByText('Glow Content')).toBeInTheDocument();
  });
});
