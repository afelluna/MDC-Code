import { useEffect, useState } from 'react';

const THEME_KEY = 'usher-mdc-theme';

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}
