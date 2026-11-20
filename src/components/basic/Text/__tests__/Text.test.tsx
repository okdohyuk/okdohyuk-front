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

  it('applies the default fg colour unless color="inherit"', () => {
    render(
      <>
        <Text>Default colour</Text>
        <Text color="inherit">Inherited colour</Text>
      </>,
    );
    expect(screen.getByText('Default colour')).toHaveClass('text-fg-1');
    const inherited = screen.getByText('Inherited colour');
    expect(inherited).toHaveClass('text-inherit');
    expect(inherited).not.toHaveClass('text-fg-1');
  });
});
