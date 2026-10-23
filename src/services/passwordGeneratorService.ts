import * as Crypto from 'expo-crypto';
import * as Clipboard from 'expo-clipboard';
import { PasswordGeneratorOptions } from '../types';

/**
 * Servicio para generar contraseñas seguras y gestionar el copiado al portapapeles.
 * Utiliza generador criptográfico aleatorio y asegura cumplimiento de requisitos.
 */

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~';

export class PasswordGeneratorService {
  /**
   * Genera una contraseña segura aleatoria basada en las opciones configurables.
   */
  static async generatePassword(options: PasswordGeneratorOptions): Promise<string> {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols } = options;

    // Validación de límites: 8 a 128 caracteres según requerimientos
    const targetLength = Math.max(8, Math.min(128, length));

    let availableChars = '';
    const guaranteedChars: string[] = [];

    if (includeUppercase) {
      availableChars += UPPERCASE_CHARS;
      guaranteedChars.push(this.getRandomChar(UPPERCASE_CHARS));
    }
    if (includeLowercase) {
      availableChars += LOWERCASE_CHARS;
      guaranteedChars.push(this.getRandomChar(LOWERCASE_CHARS));
    }
    if (includeNumbers) {
      availableChars += NUMBER_CHARS;
      guaranteedChars.push(this.getRandomChar(NUMBER_CHARS));
    }
    if (includeSymbols) {
      availableChars += SYMBOL_CHARS;
      guaranteedChars.push(this.getRandomChar(SYMBOL_CHARS));
    }

    // Si por algún motivo el usuario desmarcó todas, usamos alfanumérico por defecto
    if (availableChars.length === 0) {
      availableChars = LOWERCASE_CHARS + NUMBER_CHARS;
      guaranteedChars.push(this.getRandomChar(LOWERCASE_CHARS));
      guaranteedChars.push(this.getRandomChar(NUMBER_CHARS));
    }

    const remainingLength = targetLength - guaranteedChars.length;
    const randomChars: string[] = [];

    if (remainingLength > 0) {
      const randomBytes = await Crypto.getRandomBytesAsync(remainingLength);
      for (let i = 0; i < remainingLength; i++) {
        const index = randomBytes[i] % availableChars.length;
        randomChars.push(availableChars[index]);
      }
    }

    // Mezclamos todos los caracteres con Fisher-Yates usando aleatoriedad criptográfica
    const combined = [...guaranteedChars, ...randomChars];
    const shuffleBytes = await Crypto.getRandomBytesAsync(combined.length);

    for (let i = combined.length - 1; i > 0; i--) {
      const j = shuffleBytes[i] % (i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join('');
  }

  /**
   * Obtiene un carácter aleatorio síncrono para caracteres garantizados
   */
  private static getRandomChar(source: string): string {
    const randomByte = Crypto.getRandomValues(new Uint8Array(1))[0];
    const randomIndex = randomByte % source.length;
    return source.charAt(randomIndex);
  }

  /**
   * Copia la contraseña al portapapeles de manera segura con expo-clipboard.
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch (e) {
      console.error('Error al copiar al portapapeles:', e);
      return false;
    }
  }
}
