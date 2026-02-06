import React from 'react';
import { render, screen } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';

describe('<Select />', () => {
  it('renders selected value', () => {
    render(
      <Select defaultValue="latest">
        <SelectTrigger>
          <SelectValue placeholder="Choose sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Latest');
  });
});
