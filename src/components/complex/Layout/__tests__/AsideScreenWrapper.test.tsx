import React from 'react';
import { render, screen } from '@testing-library/react';
import AsideScreenWrapper from '../AsideScreenWrapper';

describe('<AsideScreenWrapper />', () => {
  it('renders left, center and right content', () => {
    render(
      <AsideScreenWrapper left={<div>Left Pane</div>} right={<div>Right Pane</div>}>
        <div>Center Pane</div>
      </AsideScreenWrapper>,
    );

    expect(screen.getByText('Left Pane')).toBeInTheDocument();
    expect(screen.getByText('Center Pane')).toBeInTheDocument();
    expect(screen.getByText('Right Pane')).toBeInTheDocument();
  });
});
