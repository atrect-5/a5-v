import { create } from 'zustand';
import { colors, ThemeColors } from '../theme/colors';
import { SecureStorageService } from '../services/secureStorageService';
import { ThemeMode } from '../types';

interface ThemeState {
  themeMode: ThemeMode;
  theme: ThemeColors;
  isDark: boolean;
  initTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark', // Por defecto morado oscuro moderno
  theme: colors.dark,
  isDark: true,

  initTheme: async () => {
    const saved = await SecureStorageService.getStoredTheme();
    if (saved) {
      set({
        themeMode: saved,
        theme: colors[saved],
        isDark: saved === 'dark',
      });
    }
  },

  toggleTheme: async () => {
    const nextMode: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
    await SecureStorageService.setStoredTheme(nextMode);
    set({
      themeMode: nextMode,
      theme: colors[nextMode],
      isDark: nextMode === 'dark',
    });
  },

  setThemeMode: async (mode: ThemeMode) => {
    await SecureStorageService.setStoredTheme(mode);
    set({
      themeMode: mode,
      theme: colors[mode],
      isDark: mode === 'dark',
    });
  },
}));
