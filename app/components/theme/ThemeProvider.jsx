'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'ghl-theme';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    const applied = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setThemeState(applied);
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
