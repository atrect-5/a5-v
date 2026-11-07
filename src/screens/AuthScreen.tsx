import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVaultStore } from '../store/useVaultStore';
import { useThemeStore } from '../store/useThemeStore';
import { CustomButton } from '../components/CustomButton';
import { PasswordStrengthService } from '../services/passwordStrengthService';
import { StrengthIndicator } from '../components/StrengthIndicator';

export const AuthScreen: React.FC = () => {
  const { theme, isDark } = useThemeStore();
  const {
    hasMasterPassword,
    setupMasterPassword,
    unlockWithMasterPassword,
    unlockWithBiometrics,
    canUseBiometrics,
    isBiometricsEnabled,
    biometricType,
  } = useVaultStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Intentar desbloqueo biométrico automático si está habilitado al abrir
  useEffect(() => {
    if (hasMasterPassword && isBiometricsEnabled && canUseBiometrics) {
      handleBiometricUnlock();
    }
  }, [hasMasterPassword, isBiometricsEnabled, canUseBiometrics]);

  const handleBiometricUnlock = async () => {
    setLoading(true);
    setErrorMessage('');
    const success = await unlockWithBiometrics();
    setLoading(false);
    if (!success) {
      // Si falla o cancela, puede ingresar la contraseña maestra
    }
  };

  const handleUnlock = async () => {
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña maestra.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    const success = await unlockWithMasterPassword(password);
    setLoading(false);
    if (!success) {
      setErrorMessage('Contraseña maestra incorrecta. Inténtalo de nuevo.');
    }
  };

  const handleSetup = async () => {
    if (!password || password.length < 8) {
      setErrorMessage('La contraseña maestra debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    const success = await setupMasterPassword(password);
    setLoading(false);
    if (!success) {
      setErrorMessage('Error al inicializar la contraseña maestra.');
    }
  };

  // Medición de seguridad para la nueva contraseña maestra
  const masterEvaluation = PasswordStrengthService.evaluate(password);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Escudo animado */}
        <View style={styles.brandContainer}>
          <View
            style={[
              styles.shieldWrapper,
              {
                backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
          >
            <Ionicons
              name={hasMasterPassword ? 'lock-closed' : 'shield-checkmark'}
              size={48}
              color={theme.primary}
            />
          </View>
          <Text style={[styles.brandTitle, { color: theme.text }]}>
            {hasMasterPassword ? 'Bóveda Protegida' : 'Bienvenido a tu Gestor'}
          </Text>
          <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
            {hasMasterPassword
              ? 'Ingresa tu contraseña maestra para descifrar tus credenciales locales'
              : 'Configura tu contraseña maestra para cifrar tus datos con AES-256 de forma segura'}
          </Text>
        </View>

        {/* Tarjeta de Formulario */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {errorMessage.length > 0 && (
            <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Campo Contraseña Maestra */}
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            {hasMasterPassword ? 'Contraseña Maestra' : 'Nueva Contraseña Maestra'}
          </Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}>
            <Ionicons name="key-outline" size={20} color={theme.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Escribe tu clave maestra..."
              placeholderTextColor={theme.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>

          {/* Indicador de fuerza durante el registro */}
          {!hasMasterPassword && password.length > 0 && (
            <View style={styles.strengthWrapper}>
              <StrengthIndicator evaluation={masterEvaluation} showDetails={false} />
            </View>
          )}

          {/* Confirmar Contraseña (solo primer setup) */}
          {!hasMasterPassword && (
            <>
              <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                Confirmar Contraseña Maestra
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}>
                <Ionicons name="checkmark-done-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Repite tu clave maestra..."
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrorMessage('');
                  }}
                  autoCapitalize="none"
                />
              </View>
            </>
          )}

          {/* Botón Principal */}
          <View style={styles.buttonSpacing}>
            <CustomButton
              title={hasMasterPassword ? 'Desbloquear Bóveda' : 'Inicializar Gestor Seguro'}
              onPress={hasMasterPassword ? handleUnlock : handleSetup}
              loading={loading}
              icon={hasMasterPassword ? 'lock-open-outline' : 'shield-checkmark-outline'}
              size="lg"
            />
          </View>

          {/* Botón de Desbloqueo Biométrico (si aplica) */}
          {hasMasterPassword && canUseBiometrics && isBiometricsEnabled && (
            <View style={styles.biometricSpacing}>
              <CustomButton
                title={`Desbloquear con ${biometricType}`}
                onPress={handleBiometricUnlock}
                variant="secondary"
                icon="finger-print-outline"
                size="md"
              />
            </View>
          )}
        </View>

        {/* Nota de Seguridad */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-outline" size={16} color={theme.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.securityNoteText, { color: theme.textMuted }]}>
            Cifrado AES-256 local. Ninguna clave viaja a la nube ni se guarda sin cifrar.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  shieldWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 6,
  },
  strengthWrapper: {
    marginTop: 6,
  },
  buttonSpacing: {
    marginTop: 22,
  },
  biometricSpacing: {
    marginTop: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    paddingHorizontal: 16,
  },
  securityNoteText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
