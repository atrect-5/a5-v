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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useVaultStore } from '../store/useVaultStore';
import { HeaderBar } from '../components/HeaderBar';
import { CustomButton } from '../components/CustomButton';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme, themeMode } = useThemeStore();
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
  const [changingPass, setChangingPass] = useState(false);

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
      Alert.alert('Éxito', 'Tu contraseña maestra ha sido actualizada y la bóveda se re-cifró.');
      setPasswordModalVisible(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight }]}>
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={20}
                  color={theme.primary}
                />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  {isDark ? 'Tema Oscuro (Morado)' : 'Tema Claro (Azul)'}
                </Text>
                <Text style={[styles.settingDesc, { color: theme.textMuted }]}>
                  {isDark
                    ? 'Paleta fría con tonos violeta y morado'
                    : 'Paleta fría con tonos azul y pizarra'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.cardSecondary, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
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
              <View style={[styles.iconBox, { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight }]}>
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
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
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
      </ScrollView>

      {/* Modal para cambio de contraseña maestra */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Cambiar Contraseña Maestra
            </Text>
            <Text style={[styles.modalDesc, { color: theme.textMuted }]}>
              Tus credenciales guardadas se volverán a cifrar de forma segura con tu nueva clave.
            </Text>

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.cardSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Contraseña maestra actual"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.cardSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Nueva contraseña maestra (mín. 8 caracteres)"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.cardSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Confirmar nueva contraseña"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancelar"
                onPress={() => setPasswordModalVisible(false)}
                variant="ghost"
                style={{ flex: 1, marginRight: 8 }}
              />
              <CustomButton
                title="Actualizar"
                onPress={handleChangePassword}
                loading={changingPass}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
