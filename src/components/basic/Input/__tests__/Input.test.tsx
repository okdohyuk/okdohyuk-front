import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Input } from '../Input';

describe('<Input />', () => {
  it('renders placeholder', () => {
    render(<Input placeholder="Search here" />);
    expect(screen.getByPlaceholderText('Search here')).toBeInTheDocument();
  });

  it('updates value on change', () => {
    render(<Input aria-label="query-input" />);
    const input = screen.getByLabelText('query-input') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'hello' } });
    expect(input.value).toBe('hello');
  });
});
