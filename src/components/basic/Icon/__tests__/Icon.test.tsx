import React from 'react';
import { render } from '@testing-library/react';
import Icon from '../index';

describe('<Icon />', () => {
  it('merges className and applies size', () => {
    const { container } = render(
      <Icon icon={<svg className="base-icon" />} className="custom-icon" size={20} />,
    );
    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('base-icon');
    expect(svg).toHaveClass('custom-icon');
    expect(svg).toHaveAttribute('size', '20');
  });
});
