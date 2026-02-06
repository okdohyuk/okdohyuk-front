import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Textarea } from '../Textarea';

describe('<Textarea />', () => {
  it('renders textarea element', () => {
    render(<Textarea aria-label="content-textarea" />);
    expect(screen.getByLabelText('content-textarea')).toBeInTheDocument();
  });

  it('updates value on input', () => {
    render(<Textarea aria-label="content-textarea" />);
    const textarea = screen.getByLabelText('content-textarea') as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'memo text' } });
    expect(textarea.value).toBe('memo text');
  });
});
