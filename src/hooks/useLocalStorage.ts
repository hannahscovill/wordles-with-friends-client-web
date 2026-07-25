import { useState, useCallback, useEffect } from 'react';

type SetValue<T> = (value: T | null) => void;

const eventName = (key: string): string => `local-storage:${key}`;

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

  // Other useLocalStorage instances for this key (e.g. the header badge vs.
  // the page that clears it) live in separate components and don't remount
  // on client-side navigation, so they need to be told a write happened.
  useEffect(() => {
    const handleChange = (): void => {
      try {
        const item: string | null = localStorage.getItem(key);
        setStoredValue(item !== null ? (JSON.parse(item) as T) : initialValue);
      } catch {
        setStoredValue(initialValue);
      }
    };
    window.addEventListener(eventName(key), handleChange);
    return (): void => window.removeEventListener(eventName(key), handleChange);
  }, [key, initialValue]);

  const setValue: SetValue<T> = useCallback(
    (value: T | null): void => {
      try {
        setStoredValue(value);
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
        window.dispatchEvent(new Event(eventName(key)));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue];
};
