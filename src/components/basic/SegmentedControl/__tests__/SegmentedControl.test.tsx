/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SegmentedControl } from '../SegmentedControl';

type Value = 'a' | 'b' | 'c';

const OPTIONS = [
  { value: 'a' as const, label: 'Alpha' },
  { value: 'b' as const, label: 'Beta' },
  { value: 'c' as const, label: 'Gamma' },
];

function Harness({ initial = 'a' as Value }: { initial?: Value }) {
  const [value, setValue] = useState<Value>(initial);
  return (
    <SegmentedControl<Value>
      value={value}
      onChange={setValue}
      options={OPTIONS}
      ariaLabel="picker"
    />
  );
}

describe('<SegmentedControl />', () => {
  it('renders all options as radios', () => {
    render(<Harness />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('marks the active option with aria-checked=true', () => {
    render(<Harness initial="b" />);
    expect(screen.getByRole('radio', { name: 'Beta' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'false');
  });

  it('changes value when an option is clicked', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('radio', { name: 'Gamma' }));
    expect(screen.getByRole('radio', { name: 'Gamma' })).toHaveAttribute('aria-checked', 'true');
  });

  it('respects disabled options', () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl<Value>
        value="a"
        onChange={onChange}
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta', disabled: true },
        ]}
      />,
    );
    const disabled = screen.getByRole('radio', { name: 'Beta' });
    expect(disabled).toBeDisabled();
    fireEvent.click(disabled);
    expect(onChange).not.toHaveBeenCalled();
  });
});
