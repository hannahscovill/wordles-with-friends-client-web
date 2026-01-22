import { useState, useCallback } from 'react';

type SetValue<T> = (value: T | null) => void;

export const useLocalStorage = <T>(
  key: string,
  initialValue: T | null = null,
): [T | null, SetValue<T>] => {
  const [storedValue, setStoredValue] = useState<T | null>((): T | null => {
    try {
      const item: string | null = localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue: SetValue<T> = useCallback(
    (value: T | null): void => {
      try {
        setStoredValue(value);
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
};
