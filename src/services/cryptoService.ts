import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

/**
 * Servicio criptográfico responsable de:
 * 1. Hashear la contraseña maestra con sal criptográfica usando expo-crypto.
 * 2. Cifrar datos en reposo con AES-256 antes de guardarlos en AsyncStorage.
 * 3. Descifrar los datos una vez validada la clave maestra.
 * 4. Generación de bytes y números aleatorios seguros.
 */

export class CryptoService {
  /**
   * Genera una sal criptográfica aleatoria de longitud especificada.
   */
  static async generateSalt(length = 32): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(length);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Genera el hash seguro de la contraseña maestra concatenada con la sal usando SHA-256.
   * Se usa para validar el ingreso del usuario sin almacenar la clave en texto plano.
   */
  static async hashMasterPassword(password: string, salt: string): Promise<string> {
    const combined = `${salt}:${password}:${salt}`;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined
    );
    return hash;
  }

  /**
   * Cifra un objeto o cadena de datos usando AES-256 con la clave proporcionada.
   * Retorna una cadena Base64 cifrada.
   */
  static encryptData<T>(data: T, secretKey: string): string {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
    return encrypted;
  }

  /**
   * Descifra una cadena cifrada con AES-256 utilizando la clave provista.
   * Retorna el objeto deserializado o null si la clave es incorrecta o los datos están corruptos.
   */
  static decryptData<T>(cipherText: string, secretKey: string): T | null {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedString) {
        return null;
      }
      return JSON.parse(decryptedString) as T;
    } catch (error) {
      console.warn('Error al descifrar datos (clave errónea o datos alterados):', error);
      return null;
    }
  }

  /**
   * Genera un identificador único seguro (UUID v4) usando expo-crypto.
   */
  static generateId(): string {
    return Crypto.randomUUID();
  }
}
