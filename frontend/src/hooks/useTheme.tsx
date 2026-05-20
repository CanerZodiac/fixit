import React, { createContext, useContext, useEffect, useState } from 'react';

type Mode = 'dark' | 'light';
type ColorTheme = 'amber' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  mode: Mode;
  colorTheme: ColorTheme;
  setMode: (mode: Mode) => void;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    return (localStorage.getItem('theme-mode') as Mode) || 'dark';
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    return (localStorage.getItem('theme-color') as ColorTheme) || 'amber';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous modes
    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${mode}`);
    localStorage.setItem('theme-mode', mode);

    // Remove previous colors
    root.classList.remove('color-amber', 'color-blue', 'color-green', 'color-purple');
    root.classList.add(`color-${colorTheme}`);
    localStorage.setItem('theme-color', colorTheme);

  }, [mode, colorTheme]);

  return (
    <ThemeContext.Provider value={{ mode, colorTheme, setMode: setModeState, setColorTheme: setColorThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
