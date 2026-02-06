import React from 'react';
import { render, screen } from '@testing-library/react';
import Tag from '../index';

describe('<Tag />', () => {
  it('renders tag text', () => {
    render(<Tag tag="react" />);
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
