import { useState, useEffect } from "react";

export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState(() => {
    const isLocalStorageAvailable =
      typeof window !== "undefined" && window.localStorage;
    const saved = isLocalStorageAvailable ? localStorage.getItem(key) : null;
    try {
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return typeof defaultValue === typeof saved ? saved : defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
