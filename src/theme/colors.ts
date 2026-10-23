/**
 * Tokens de color para la aplicación.
 * Sigue la regla de diseño:
 * - Azul para el tema claro (colores fríos, elegantes y limpios)
 * - Morado para el tema oscuro (tonos fríos profundos con acentos púrpuras)
 */

export interface ThemeColors {
  background: string;
  card: string;
  cardSecondary: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  warning: string;
  statusBar: 'light-content' | 'dark-content';
}

export const colors: { light: ThemeColors; dark: ThemeColors; security: Record<string, string> } = {
  light: {
    background: '#F0F4F8',        // Fondo grisáceo azulado frío
    card: '#FFFFFF',              // Superficie blanca limpia
    cardSecondary: '#E2E8F0',     // Superficie secundaria
    border: '#CBD5E1',            // Borde suave
    text: '#0F172A',              // Texto oscuro pizarra
    textSecondary: '#475569',     // Texto secundario
    textMuted: '#94A3B8',         // Texto tenue
    primary: '#2563EB',           // Azul primario vibrante
    primaryHover: '#1D4ED8',      // Azul hover / presionado
    primaryLight: '#DBEAFE',      // Fondo suave de azul
    accent: '#0284C7',            // Acento cian/azul
    danger: '#EF4444',            // Rojo para acciones destructivas
    dangerLight: '#FEE2E2',
    success: '#10B981',           // Verde éxito
    successLight: '#D1FAE5',
    warning: '#F59E0B',           // Ámbar advertencia
    statusBar: 'dark-content',
  },
  dark: {
    background: '#090714',        // Fondo morado/índigo muy oscuro
    card: '#130E26',              // Tarjetas violeta oscuro elegante
    cardSecondary: '#1C1538',     // Tarjetas secundarias
    border: '#281F4D',            // Borde púrpura sutil
    text: '#F8FAFC',              // Texto blanco suave
    textSecondary: '#CBD5E1',     // Texto secundario claro
    textMuted: '#6B7280',         // Texto atenuado
    primary: '#8B5CF6',           // Morado vibrante moderno
    primaryHover: '#7C3AED',      // Morado presionado
    primaryLight: '#2A1B54',      // Fondo tenue púrpura
    accent: '#A855F7',            // Acento lila
    danger: '#F87171',            // Rojo suave oscuro
    dangerLight: '#3F1717',
    success: '#34D399',           // Verde esmeralda suave
    successLight: '#0E3326',
    warning: '#FBBF24',           // Ámbar suave
    statusBar: 'light-content',
  },
  // Niveles de seguridad de contraseña
  security: {
    score0: '#EF4444', // Muy débil (Rojo)
    score1: '#F97316', // Débil (Naranja)
    score2: '#FBBF24', // Regular (Amarillo)
    score3: '#10B981', // Fuerte (Verde)
    score4: '#059669', // Muy fuerte (Esmeralda oscuro)
  }
};
