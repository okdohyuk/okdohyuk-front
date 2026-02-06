import React from 'react';
import { render, screen } from '@testing-library/react';
import MobileScreenWrapper from '../MobileScreenWrapper';

describe('<MobileScreenWrapper />', () => {
  it('renders children', () => {
    render(
      <MobileScreenWrapper>
        <div>Mobile content</div>
      </MobileScreenWrapper>,
    );

    expect(screen.getByText('Mobile content')).toBeInTheDocument();
  });

  it('applies text and item alignment classes', () => {
    const { container } = render(
      <MobileScreenWrapper text="center" items="center">
        <div>Centered</div>
      </MobileScreenWrapper>,
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('text-center');
    expect(wrapper).toHaveClass('items-center');
  });
});
