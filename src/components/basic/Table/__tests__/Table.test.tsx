import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';

describe('<Table />', () => {
  it('renders header and body cells', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
  });
});
