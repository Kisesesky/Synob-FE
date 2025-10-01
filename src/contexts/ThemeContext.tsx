"use client";

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type PrimaryColor = 'blue' | 'red' | 'green' | 'yellow' | 'white';
export type Background = string; // For now, just a URL

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
  background: Background;
  setBackground: (background: Background) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  defaultPrimaryColor = 'blue',
  primaryColorStorageKey = 'vite-ui-primary-color',
  defaultBackground = '',
  backgroundStorageKey = 'vite-ui-background',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  defaultPrimaryColor?: PrimaryColor;
  primaryColorStorageKey?: string;
  defaultBackground?: Background;
  backgroundStorageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(() => {
    if (typeof window === 'undefined') {
      return defaultPrimaryColor;
    }
    return (localStorage.getItem(primaryColorStorageKey) as PrimaryColor) || defaultPrimaryColor;
  });

  const [background, setBackground] = useState<Background>(() => {
    if (typeof window === 'undefined') {
      return defaultBackground;
    }
    return (localStorage.getItem(backgroundStorageKey) as Background) || defaultBackground;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let systemTheme: Theme = 'light';
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      systemTheme = 'dark';
    }

    const currentTheme = theme === 'system' ? systemTheme : theme;
    root.classList.add(currentTheme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--primary-color', `var(--${primaryColor}-500)`);
    root.style.setProperty('--primary-color-foreground', `var(--${primaryColor}-foreground)`);
  }, [primaryColor]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (background) {
      root.style.setProperty('--custom-bg-url', `url(${background})`);
      root.classList.add('custom-background');
    } else {
      root.style.removeProperty('--custom-bg-url');
      root.classList.remove('custom-background');
    }
  }, [background]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
      setTheme(newTheme);
    },
    primaryColor,
    setPrimaryColor: (newColor: PrimaryColor) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(primaryColorStorageKey, newColor);
      }
      setPrimaryColor(newColor);
    },
    background,
    setBackground: (newBackground: Background) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(backgroundStorageKey, newBackground);
      }
      setBackground(newBackground);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};