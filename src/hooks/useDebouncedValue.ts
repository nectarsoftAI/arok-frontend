import { useEffect, useState } from 'react';

/** value 가 delay 동안 더 이상 바뀌지 않으면 그 값을 반환한다. */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
