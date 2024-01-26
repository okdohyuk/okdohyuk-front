import { useEffect, useState } from 'react';

export default function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (debouncedValue === null) return setDebouncedValue(value);
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
