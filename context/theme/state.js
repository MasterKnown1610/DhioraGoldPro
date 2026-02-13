import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@gold_theme';

export const lightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEEEEE',
  text: '#1A1A1A',
  textSecondary: '#555555',
  accent: '#F8C24D',
  accentText: '#1A1A1A',
  border: '#E0E0E0',
  icon: '#333333',
  overlay: 'rgba(0,0,0,0.25)',
};

export const darkColors = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  surfaceSecondary: '#333333',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  accent: '#F8C24D',
  accentText: '#1A1A1A',
  border: '#444444',
  icon: '#F8C24D',
  overlay: 'rgba(0,0,0,0.35)',
};

export const useThemeState = () => {
  const [isDark, setIsDark] = useState(true);

  const loadTheme = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored !== null) {
        setIsDark(stored === 'dark');
      }
    } catch {
      // keep default
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const toggleTheme = useCallback(async () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      isDark,
      theme: isDark ? 'dark' : 'light',
      colors: isDark ? darkColors : lightColors,
      toggleTheme,
    }),
    [isDark, toggleTheme]
  );
};
