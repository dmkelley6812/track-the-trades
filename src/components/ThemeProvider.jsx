import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  mode: 'system',
  palette: 'colorful',
  setMode: () => {},
  setPalette: () => {},
  actualMode: 'dark' // resolved mode (system -> dark/light)
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem('theme-mode') || 'system';
  });

  const [palette, setPaletteState] = useState(() => {
    if (typeof window === 'undefined') return 'colorful';
    return localStorage.getItem('theme-palette') || 'colorful';
  });

  const [actualMode, setActualMode] = useState('dark');

  // Resolve system mode
  const getSystemMode = () => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const resolveMode = (m) => {
    return m === 'system' ? getSystemMode() : m;
  };

  const setMode = (newMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const setPalette = (newPalette) => {
    setPaletteState(newPalette);
    localStorage.setItem('theme-palette', newPalette);
  };

  // Apply theme to DOM
  useEffect(() => {
    const resolved = resolveMode(mode);
    setActualMode(resolved);
    
    const root = document.documentElement;
    root.setAttribute('data-mode', resolved);
    root.setAttribute('data-palette', palette);
  }, [mode, palette]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemMode();
      setActualMode(resolved);
      document.documentElement.setAttribute('data-mode', resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, palette, setMode, setPalette, actualMode }}>
      {children}
    </ThemeContext.Provider>
  );
}