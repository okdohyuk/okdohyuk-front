import { useState, useCallback, ChangeEvent } from 'react';

export default function useInput(initialForm: string) {
  const [value, setValue] = useState<string>(initialForm);
  const [isValue, setIsValue] = useState(false);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsValue(e.target.value.length > 0);
  };
  const reset = useCallback(() => setValue(initialForm), [initialForm]);
  return { value, onChange, reset, isValue };
}
