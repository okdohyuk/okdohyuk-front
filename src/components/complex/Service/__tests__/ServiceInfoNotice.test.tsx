import React from 'react';
import { render, screen } from '@testing-library/react';
import ServiceInfoNotice from '../ServiceInfoNotice';

describe('<ServiceInfoNotice />', () => {
  it('renders icon and text', () => {
    render(
      <ServiceInfoNotice icon={<span data-testid="notice-icon">i</span>}>
        Notice message
      </ServiceInfoNotice>,
    );

    expect(screen.getByTestId('notice-icon')).toBeInTheDocument();
    expect(screen.getByText('Notice message')).toBeInTheDocument();
  });

  it('renders action slot when provided', () => {
    render(
      <ServiceInfoNotice
        icon={<span>i</span>}
        action={
          <button type="button" aria-label="open-action">
            Open
          </button>
        }
      >
        With action
      </ServiceInfoNotice>,
    );

    expect(screen.getByRole('button', { name: 'open-action' })).toBeInTheDocument();
  });
});
