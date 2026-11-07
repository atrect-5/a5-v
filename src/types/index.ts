/**
 * Definiciones de tipos principales para el gestor de contraseñas
 */

export interface PasswordItem {
  id: string;
  serviceName: string; // Nombre del sitio web o servicio (ej. Facebook, Gmail, etc.)
  username: string;    // Email o nombre de usuario
  password: string;    // Contraseña almacenada
  notes?: string;      // Notas opcionales
  createdAt: string;   // Fecha de creación en formato ISO
  updatedAt: string;   // Fecha de actualización en formato ISO
  recommendedChangeDate: string; // Fecha recomendada de cambio de contraseña en formato ISO
  category?: 'general' | 'social' | 'email' | 'work' | 'finance'; // Categoría opcional para organización
}

export interface PasswordGeneratorOptions {
  length: number;           // Longitud entre 8 y 128 caracteres
  includeUppercase: boolean; // Incluir mayúsculas (A-Z)
  includeLowercase: boolean; // Incluir minúsculas (a-z)
  includeNumbers: boolean;   // Incluir números (0-9)
  includeSymbols: boolean;   // Incluir símbolos (!@#$%^&*...)
}

export type SecurityScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordEvaluationResult {
  score: SecurityScore; // 0 = Muy débil, 1 = Débil, 2 = Regular, 3 = Fuerte, 4 = Muy fuerte
  label: string;
  color: string;
  warning?: string;
  suggestions: string[];
  crackTimeDisplay: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface VaultStats {
  total: number;
  weakCount: number;
  reusedCount: number;
  expiredCount: number; // Que hayan superado o estén cerca de recommendedChangeDate
}
