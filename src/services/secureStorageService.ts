import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PasswordItem, ThemeMode } from '../types';
import { CryptoService } from './cryptoService';

/**
 * Claves de almacenamiento para SecureStore y AsyncStorage
 */
const SECURE_KEYS = {
  MASTER_HASH: 'master_password_hash',
  MASTER_SALT: 'master_password_salt',
  BIOMETRIC_ACTIVE: 'biometric_auth_active',
  BIOMETRIC_VAULT_KEY: 'biometric_cached_key', // Clave cifrada para permitir desbloqueo biométrico
};

const STORAGE_KEYS = {
  ENCRYPTED_VAULT: '@secure_vault_encrypted_v1',
  THEME_MODE: '@app_theme_mode',
};

export class SecureStorageService {
  /**
   * Determina si ya existe una contraseña maestra configurada en el dispositivo.
   */
  static async hasMasterPassword(): Promise<boolean> {
    try {
      const hash = await SecureStore.getItemAsync(SECURE_KEYS.MASTER_HASH);
      return !!hash;
    } catch (e) {
      console.error('Error al consultar master password:', e);
      return false;
    }
  }

  /**
   * Configura por primera vez la contraseña maestra del usuario.
   */
  static async setupMasterPassword(password: string): Promise<boolean> {
    try {
      const salt = await CryptoService.generateSalt(32);
      const hash = await CryptoService.hashMasterPassword(password, salt);

      await SecureStore.setItemAsync(SECURE_KEYS.MASTER_SALT, salt);
      await SecureStore.setItemAsync(SECURE_KEYS.MASTER_HASH, hash);

      // Inicializa el baúl vacío pero cifrado
      const emptyVaultEncrypted = CryptoService.encryptData<PasswordItem[]>([], password);
      await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_VAULT, emptyVaultEncrypted);

      return true;
    } catch (e) {
      console.error('Error al registrar master password:', e);
      return false;
    }
  }

  /**
   * Valida la contraseña maestra ingresada por el usuario.
   */
  static async verifyMasterPassword(password: string): Promise<boolean> {
    try {
      const storedSalt = await SecureStore.getItemAsync(SECURE_KEYS.MASTER_SALT);
      const storedHash = await SecureStore.getItemAsync(SECURE_KEYS.MASTER_HASH);

      if (!storedSalt || !storedHash) {
        return false;
      }

      const calculatedHash = await CryptoService.hashMasterPassword(password, storedSalt);
      return calculatedHash === storedHash;
    } catch (e) {
      console.error('Error al verificar master password:', e);
      return false;
    }
  }

  /**
   * Cambia la contraseña maestra existente por una nueva y re-cifra el baúl con la nueva clave.
   */
  static async changeMasterPassword(oldPass: string, newPass: string): Promise<boolean> {
    const isValid = await this.verifyMasterPassword(oldPass);
    if (!isValid) return false;

    // Obtener los datos actuales descifrándolos con la vieja contraseña
    const currentItems = await this.loadVaultItems(oldPass);
    if (currentItems === null) return false;

    // Generar nueva sal y hash
    const newSalt = await CryptoService.generateSalt(32);
    const newHash = await CryptoService.hashMasterPassword(newPass, newSalt);

    await SecureStore.setItemAsync(SECURE_KEYS.MASTER_SALT, newSalt);
    await SecureStore.setItemAsync(SECURE_KEYS.MASTER_HASH, newHash);

    // Guardar el baúl re-cifrado con la nueva clave
    await this.saveVaultItems(currentItems, newPass);

    // Si biometría estaba activa, actualizar la clave protegida
    const biometricsEnabled = await this.isBiometricsEnabled();
    if (biometricsEnabled) {
      await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_VAULT_KEY, newPass);
    }

    return true;
  }

  /**
   * Carga y descifra los items de la bóveda guardados en AsyncStorage con la clave provista.
   */
  static async loadVaultItems(secretKey: string): Promise<PasswordItem[] | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(STORAGE_KEYS.ENCRYPTED_VAULT);
      if (!encryptedData) {
        return [];
      }
      return CryptoService.decryptData<PasswordItem[]>(encryptedData, secretKey);
    } catch (e) {
      console.error('Error al cargar baúl:', e);
      return null;
    }
  }

  /**
   * Cifra los items con AES-256 y los guarda en AsyncStorage.
   */
  static async saveVaultItems(items: PasswordItem[], secretKey: string): Promise<boolean> {
    try {
      const cipherText = CryptoService.encryptData(items, secretKey);
      await AsyncStorage.setItem(STORAGE_KEYS.ENCRYPTED_VAULT, cipherText);
      return true;
    } catch (e) {
      console.error('Error al guardar baúl:', e);
      return false;
    }
  }

  /**
   * Configuración de autenticación biométrica
   */
  static async isBiometricsEnabled(): Promise<boolean> {
    try {
      const val = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_ACTIVE);
      return val === 'true';
    } catch {
      return false;
    }
  }

  static async setBiometricsEnabled(enabled: boolean, currentKey?: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_ACTIVE, enabled ? 'true' : 'false');
      if (enabled && currentKey) {
        await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_VAULT_KEY, currentKey);
      } else if (!enabled) {
        await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_VAULT_KEY);
      }
    } catch (e) {
      console.error('Error al configurar biometría:', e);
    }
  }

  static async getBiometricVaultKey(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_VAULT_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Almacenamiento de preferencia de tema
   */
  static async getStoredTheme(): Promise<ThemeMode | null> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (theme === 'system' || theme === 'light' || theme === 'dark') return theme;
      return null;
    } catch {
      return null;
    }
  }

  static async setStoredTheme(theme: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, theme);
    } catch (e) {
      console.error('Error guardando preferencia de tema:', e);
    }
  }
}
