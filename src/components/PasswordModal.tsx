import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordItem } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import { PasswordStrengthService } from '../services/passwordStrengthService';
import { PasswordGeneratorService } from '../services/passwordGeneratorService';
import { StrengthIndicator } from './StrengthIndicator';
import { CustomButton } from './CustomButton';

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: {
    serviceName: string;
    username: string;
    password: string;
    notes?: string;
    recommendedChangeDate?: string;
    category?: PasswordItem['category'];
  }) => Promise<boolean>;
  initialData?: PasswordItem | null;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const { theme, isDark } = useThemeStore();

  const [serviceName, setServiceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<PasswordItem['category']>('general');
  const [changeIntervalDays, setChangeIntervalDays] = useState(90); // 30, 60, 90, 180 días
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inicializar campos según si es edición o nueva creación
  useEffect(() => {
    if (initialData) {
      setServiceName(initialData.serviceName);
      setUsername(initialData.username);
      setPassword(initialData.password);
      setNotes(initialData.notes || '');
      setCategory(initialData.category || 'general');
    } else {
      setServiceName('');
      setUsername('');
      setPassword('');
      setNotes('');
      setCategory('general');
      setChangeIntervalDays(90);
    }
    setCopied(false);
    setShowPassword(false);
  }, [initialData, visible]);

  // Evaluación en tiempo real con zxcvbn-ts
  const evaluation = PasswordStrengthService.evaluate(password, [serviceName, username]);

  // Generar contraseña aleatoria rápida
  const handleQuickGenerate = async () => {
    const generated = await PasswordGeneratorService.generatePassword({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    setPassword(generated);
    setShowPassword(true);
  };

  // Copiar al portapapeles
  const handleCopy = async () => {
    if (!password) return;
    await PasswordGeneratorService.copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Guardar elemento
  const handleSave = async () => {
    if (!serviceName.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el nombre del servicio o sitio web.');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa el email o nombre de usuario.');
      return;
    }
    if (!password) {
      Alert.alert('Campo requerido', 'Por favor ingresa o genera una contraseña.');
      return;
    }

    setSaving(true);
    const recommendedDate = new Date();
    recommendedDate.setDate(recommendedDate.getDate() + changeIntervalDays);

    const success = await onSave({
      serviceName,
      username,
      password,
      notes,
      category,
      recommendedChangeDate: recommendedDate.toISOString(),
    });

    setSaving(false);
    if (success) {
      onClose();
    } else {
      Alert.alert('Error', 'No se pudo guardar la contraseña.');
    }
  };

  const categories: Array<{ id: PasswordItem['category']; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'general', label: 'General', icon: 'key-outline' },
    { id: 'social', label: 'Social', icon: 'logo-twitter' },
    { id: 'email', label: 'Email', icon: 'mail-outline' },
    { id: 'work', label: 'Trabajo', icon: 'briefcase-outline' },
    { id: 'finance', label: 'Finanzas', icon: 'card-outline' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {/* Cabecera del modal */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {initialData ? 'Editar Contraseña' : 'Nueva Contraseña'}
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.textMuted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Campo: Sitio Web / Servicio */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Sitio web o servicio *</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="globe-outline" size={20} color={theme.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ej. Facebook, Gmail, Netflix, Banco..."
              placeholderTextColor={theme.textMuted}
              value={serviceName}
              onChangeText={setServiceName}
              autoCapitalize="words"
            />
          </View>

          {/* Campo: Usuario / Email */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Email o nombre de usuario *</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={20} color={theme.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="usuario@ejemplo.com"
              placeholderTextColor={theme.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Campo: Contraseña con acciones */}
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña *</Text>
            <Pressable onPress={handleQuickGenerate} style={styles.actionLink}>
              <Ionicons name="sparkles" size={14} color={theme.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.actionLinkText, { color: theme.primary }]}>Generar Segura</Text>
            </Pressable>
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text, fontFamily: 'monospace' }]}
              placeholder="Ingresa o genera una clave"
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {/* Toggle ver contraseña */}
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.iconAction}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
            {/* Copiar al portapapeles */}
            <Pressable onPress={handleCopy} style={styles.iconAction}>
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={20}
                color={copied ? theme.success : theme.primary}
              />
            </Pressable>
          </View>

          {/* Medidor de Fuerza con zxcvbn-ts */}
          {password.length > 0 && (
            <View style={[styles.strengthCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <StrengthIndicator evaluation={evaluation} showDetails={true} />
            </View>
          )}

          {/* Categoría */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={14}
                    color={isSelected ? '#FFFFFF' : theme.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Recomendación de cambio de contraseña */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Recordar cambio de contraseña en:
          </Text>
          <View style={styles.intervalRow}>
            {[30, 60, 90, 180].map((days) => {
              const isSelected = changeIntervalDays === days;
              return (
                <Pressable
                  key={days}
                  onPress={() => setChangeIntervalDays(days)}
                  style={[
                    styles.intervalChip,
                    {
                      backgroundColor: isSelected ? (isDark ? theme.primaryLight : '#DBEAFE') : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.intervalText,
                      { color: isSelected ? theme.primary : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {days} días
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Campo: Notas */}
          <Text style={[styles.label, { color: theme.textSecondary }]}>Notas adicionales (Opcional)</Text>
          <View style={[styles.textAreaContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[styles.textArea, { color: theme.text }]}
              placeholder="Preguntas de seguridad, PIN secundario, notas de recuperación..."
              placeholderTextColor={theme.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Botones de acción inferiores */}
        <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <CustomButton
            title="Cancelar"
            onPress={onClose}
            variant="ghost"
            style={{ flex: 1, marginRight: 8 }}
          />
          <CustomButton
            title={initialData ? 'Guardar Cambios' : 'Crear Contraseña'}
            onPress={handleSave}
            loading={saving}
            icon="save-outline"
            style={{ flex: 2 }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  iconAction: {
    padding: 6,
    marginLeft: 6,
  },
  strengthCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  intervalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  intervalChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  intervalText: {
    fontSize: 12,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    minHeight: 80,
  },
  textArea: {
    fontSize: 14,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
});
