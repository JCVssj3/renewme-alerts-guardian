
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService } from '@/services/storageService';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const settings = StorageService.getSettings();
    setThemeState(settings.theme);
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(systemDark);
        if (systemDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else {
        const isDarkMode = theme === 'dark';
        setIsDark(isDarkMode);
        if (isDarkMode) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const settings = StorageService.getSettings();
    StorageService.saveSettings({ ...settings, theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
