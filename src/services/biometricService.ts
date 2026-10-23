import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Servicio para autenticación biométrica (FaceID, Huella digital, Iris)
 */
export class BiometricService {
  /**
   * Comprueba si el dispositivo cuenta con hardware biométrico compatible
   */
  static async isHardwareAvailable(): Promise<boolean> {
    try {
      return await LocalAuthentication.hasHardwareAsync();
    } catch {
      return false;
    }
  }

  /**
   * Comprueba si el usuario tiene biometría configurada en el dispositivo
   */
  static async isEnrolled(): Promise<boolean> {
    try {
      return await LocalAuthentication.isEnrolledAsync();
    } catch {
      return false;
    }
  }

  /**
   * Obtiene los tipos de biometría disponibles en el dispositivo
   */
  static async getSupportedTypes(): Promise<string> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const hasFace = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);

      if (hasFace && hasFingerprint) return 'Huella o Reconocimiento Facial';
      if (hasFace) return 'Reconocimiento Facial (Face ID)';
      if (hasFingerprint) return 'Huella Digital (Touch ID)';
      return 'Biometría';
    } catch {
      return 'Biometría';
    }
  }

  /**
   * Solicita autenticación biométrica al usuario
   */
  static async authenticate(promptMessage = 'Acceder a tu bóveda segura'): Promise<boolean> {
    try {
      const isAvailable = await this.isHardwareAvailable();
      const isEnrolled = await this.isEnrolled();

      if (!isAvailable || !isEnrolled) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Usar contraseña maestra',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (e) {
      console.warn('Error en autenticación biométrica:', e);
      return false;
    }
  }
}
