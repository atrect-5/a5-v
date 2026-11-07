import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useVaultStore } from '../store/useVaultStore';
import { HeaderBar } from '../components/HeaderBar';
import { CustomButton } from '../components/CustomButton';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, themeMode, setThemeMode } = useThemeStore();
  const {
    canUseBiometrics,
    isBiometricsEnabled,
    toggleBiometrics,
    biometricType,
    changeMasterPassword,
    lockVault,
  } = useVaultStore();

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleClosePasswordModal = () => {
    setPasswordModalVisible(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleBiometricToggle = async (value: boolean) => {
    const success = await toggleBiometrics(value);
    if (!success && value) {
      Alert.alert(
        'Biometría no disponible',
        'No se pudo autenticar o el dispositivo no cuenta con biometría configurada.'
      );
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña actual.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setChangingPass(true);
    const success = await changeMasterPassword(oldPassword, newPassword);
    setChangingPass(false);

    if (success) {
      Alert.alert('Éxito', 'Tu contraseña maestra ha sido actualizada y la bóveda se re-cifró correctamente.');
      handleClosePasswordModal();
    } else {
      Alert.alert('Error', 'La contraseña actual ingresada es incorrecta.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar
        title="Ajustes y Seguridad"
        subtitle="Configuración y preferencias de la bóveda"
        showLock={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sección: Apariencia y Tema */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>APARIENCIA</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Opción 1: Sistema (Predeterminado) */}
          <Pressable
            onPress={() => setThemeMode('system')}
            accessibilityRole="radio"
            accessibilityState={{ checked: themeMode === 'system' }}
            accessibilityLabel="Tema del sistema"
            style={({ pressed }) => [
              styles.settingRow,
              {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      themeMode === 'system' ? theme.primaryLight : theme.cardSecondary,
                  },
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={20}
                  color={themeMode === 'system' ? theme.primary : theme.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Sistema (Predeterminado)
                </Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                  Sigue automáticamente el tema de tu teléfono
                </Text>
              </View>
              <Ionicons
                name={themeMode === 'system' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={themeMode === 'system' ? theme.primary : theme.border}
              />
            </View>
          </Pressable>

          {/* Opción 2: Oscuro */}
          <Pressable
            onPress={() => setThemeMode('dark')}
            accessibilityRole="radio"
            accessibilityState={{ checked: themeMode === 'dark' }}
            accessibilityLabel="Tema oscuro"
            style={({ pressed }) => [
              styles.settingRow,
              {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      themeMode === 'dark' ? theme.primaryLight : theme.cardSecondary,
                  },
                ]}
              >
                <Ionicons
                  name="moon"
                  size={20}
                  color={themeMode === 'dark' ? theme.primary : theme.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Oscuro
                </Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                  Paleta fría con tonos violeta y morado
                </Text>
              </View>
              <Ionicons
                name={themeMode === 'dark' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={themeMode === 'dark' ? theme.primary : theme.border}
              />
            </View>
          </Pressable>

          {/* Opción 3: Claro */}
          <Pressable
            onPress={() => setThemeMode('light')}
            accessibilityRole="radio"
            accessibilityState={{ checked: themeMode === 'light' }}
            accessibilityLabel="Tema claro"
            style={({ pressed }) => [
              styles.settingRow,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.settingInfo}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      themeMode === 'light' ? theme.primaryLight : theme.cardSecondary,
                  },
                ]}
              >
                <Ionicons
                  name="sunny"
                  size={20}
                  color={themeMode === 'light' ? theme.primary : theme.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Claro
                </Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                  Paleta fría con tonos azul y pizarra
                </Text>
              </View>
              <Ionicons
                name={themeMode === 'light' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={themeMode === 'light' ? theme.primary : theme.border}
              />
            </View>
          </Pressable>
        </View>

        {/* Sección: Seguridad y Claves */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>SEGURIDAD</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Biometría */}
          {canUseBiometrics && (
            <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight }]}>
                  <Ionicons name="finger-print" size={20} color={theme.primary} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: theme.text }]}>
                    {biometricType}
                  </Text>
                  <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                    Desbloqueo rápido mediante biometría
                  </Text>
                </View>
              </View>
              <Switch
                value={isBiometricsEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: theme.cardSecondary, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          )}

          {/* Cambiar contraseña maestra */}
          <Pressable
            onPress={() => setPasswordModalVisible(true)}
            style={({ pressed }) => [
              styles.settingRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight }, { marginTop: 20 }, { marginBottom: 20 }]}>
                <Ionicons name="key" size={20} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Cambiar Contraseña Maestra
                </Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                  Re-cifra toda la bóveda con una nueva clave
                </Text>
              </View>
            </View>

          </Pressable>
        </View>

        {/* Sección: Información Técnica de Cifrado */}
        <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>CRIPTOARQUITECTURA</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.techItem}>
            <Ionicons name="shield-checkmark" size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.techTitle, { color: theme.text }]}>Cifrado AES-256 en Reposo</Text>
              <Text style={[styles.techDesc, { color: theme.textMuted }]}>
                Los datos se guardan estrictamente cifrados en AsyncStorage.
              </Text>
            </View>
          </View>

          <View style={[styles.techItem, { marginTop: 12 }]}>
            <Ionicons name="hardware-chip-outline" size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.techTitle, { color: theme.text }]}>Expo SecureStore</Text>
              <Text style={[styles.techDesc, { color: theme.textMuted }]}>
                Protección con enclave de seguridad y sal criptográfica de 256 bits.
              </Text>
            </View>
          </View>

          <View style={[styles.techItem, { marginTop: 12 }]}>
            <Ionicons name="speedometer-outline" size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.techTitle, { color: theme.text }]}>Motor @zxcvbn-ts</Text>
              <Text style={[styles.techDesc, { color: theme.textMuted }]}>
                Auditoría contra ataques offline y coincidencia de patrones.
              </Text>
            </View>
          </View>
        </View>

        {/* Botón de Bloqueo Inmediato */}
        <View style={{ marginTop: 24, marginBottom: 20 }}>
          <CustomButton
            title="Bloquear Bóveda Ahora"
            onPress={lockVault}
            variant="danger"
            icon="lock-closed"
          />
        </View>
      </ScrollView >

      {/* Modal para cambio de contraseña maestra */}
      < Modal
        visible={passwordModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleClosePasswordModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <View
                style={[
                  styles.modalCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {/* Encabezado del modal */}
                  <View style={styles.modalHeaderRow}>
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor: isDark
                            ? theme.cardSecondary
                            : theme.primaryLight,
                        },
                      ]}
                    >
                      <Ionicons name="key" size={20} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalTitle, { color: theme.text }]}>
                        Cambiar Contraseña Maestra
                      </Text>
                      <Text style={[styles.modalDesc, { color: theme.textMuted }]}>
                        Tus contraseñas se re-cifrarán con la nueva clave.
                      </Text>
                    </View>
                  </View>

                  {/* Input 1: Contraseña actual */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Contraseña actual
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: theme.cardSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={theme.textMuted}
                      style={styles.inputLeadingIcon}
                    />
                    <TextInput
                      style={[styles.inputField, { color: theme.text }]}
                      placeholder="Ingresa tu contraseña actual"
                      placeholderTextColor={theme.textMuted}
                      secureTextEntry={!showOldPassword}
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => setShowOldPassword(!showOldPassword)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={theme.textMuted}
                      />
                    </Pressable>
                  </View>

                  {/* Input 2: Nueva contraseña */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Nueva contraseña maestra
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: theme.cardSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="shield-outline"
                      size={18}
                      color={theme.primary}
                      style={styles.inputLeadingIcon}
                    />
                    <TextInput
                      style={[styles.inputField, { color: theme.text }]}
                      placeholder="Mínimo 8 caracteres"
                      placeholderTextColor={theme.textMuted}
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={theme.textMuted}
                      />
                    </Pressable>
                  </View>

                  {/* Input 3: Confirmar contraseña */}
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Confirmar nueva contraseña
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: theme.cardSecondary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color={theme.primary}
                      style={styles.inputLeadingIcon}
                    />
                    <TextInput
                      style={[styles.inputField, { color: theme.text }]}
                      placeholder="Repite la nueva contraseña"
                      placeholderTextColor={theme.textMuted}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      autoCapitalize="none"
                    />
                    <Pressable
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={theme.textMuted}
                      />
                    </Pressable>
                  </View>

                  {/* Botones de acción: Cancelar y Confirmar Cambio */}
                  <View style={styles.modalActions}>
                    <CustomButton
                      title="Cancelar"
                      onPress={handleClosePasswordModal}
                      variant="secondary"
                      containerStyle={{ flex: 1, marginRight: 8 }}
                      style={{ flex: 1 }}
                    />
                    <CustomButton
                      title="Confirmar Cambio"
                      onPress={handleChangePassword}
                      loading={changingPass}
                      icon="checkmark-circle-outline"
                      containerStyle={{ flex: 1.4 }}
                      style={{ flex: 1 }}
                    />
                  </View>
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal >
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  techDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    maxHeight: '92%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputLeadingIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
});
