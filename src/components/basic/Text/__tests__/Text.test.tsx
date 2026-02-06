import React from 'react';
import { render, screen } from '@testing-library/react';
import { H1 } from '../Headers';
import { Text } from '../Text';

describe('<Text />', () => {
  it('renders plain text with variant classes', () => {
    render(<Text variant="d3">Body Text</Text>);
    const el = screen.getByText('Body Text');

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('text-sm');
  });

  it('renders as heading component', () => {
    render(<H1>Heading</H1>);
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
  });
});
