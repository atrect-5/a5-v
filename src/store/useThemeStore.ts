import { create } from 'zustand';
import { Appearance } from 'react-native';
import { colors, ThemeColors } from '../theme/colors';
import { SecureStorageService } from '../services/secureStorageService';
import { ThemeMode } from '../types';

interface ThemeState {
  themeMode: ThemeMode; // 'system' | 'light' | 'dark'
  theme: ThemeColors;
  isDark: boolean;
  initTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

/**
 * Resuelve si el modo configurado debe traducirse a tema oscuro.
 * Si el modo es 'system', consulta el esquema de color del teléfono.
 */
const resolveIsDark = (mode: ThemeMode): boolean => {
  if (mode === 'system') {
    return Appearance.getColorScheme() !== 'light';
  }
  return mode === 'dark';
};

// Por defecto inicia en 'system' para seguir la configuración del teléfono
const defaultMode: ThemeMode = 'system';
const initialIsDark = resolveIsDark(defaultMode);

let isAppearanceListenerRegistered = false;

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: defaultMode,
  theme: initialIsDark ? colors.dark : colors.light,
  isDark: initialIsDark,

  initTheme: async () => {
    // Escucha cambios del tema del sistema en tiempo real si el modo es 'system'
    if (!isAppearanceListenerRegistered) {
      isAppearanceListenerRegistered = true;
      Appearance.addChangeListener(({ colorScheme }) => {
        if (get().themeMode === 'system') {
          const dark = colorScheme !== 'light';
          set({
            isDark: dark,
            theme: dark ? colors.dark : colors.light,
          });
        }
      });
    }

    // Carga la preferencia guardada; si no existe, toma 'system' por defecto
    const saved = await SecureStorageService.getStoredTheme();
    const activeMode: ThemeMode = saved || 'system';
    const dark = resolveIsDark(activeMode);

    set({
      themeMode: activeMode,
      theme: dark ? colors.dark : colors.light,
      isDark: dark,
    });
  },

  toggleTheme: async () => {
    const nextMode: ThemeMode = get().isDark ? 'light' : 'dark';
    await get().setThemeMode(nextMode);
  },

  setThemeMode: async (mode: ThemeMode) => {
    await SecureStorageService.setStoredTheme(mode);
    const dark = resolveIsDark(mode);
    set({
      themeMode: mode,
      theme: dark ? colors.dark : colors.light,
      isDark: dark,
    });
  },
}));
