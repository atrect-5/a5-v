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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Estados del formulario
  const [serviceName, setServiceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<PasswordItem['category']>('general');
  const [changeIntervalDays, setChangeIntervalDays] = useState(90); // 30, 60, 90, 180 días
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados del generador interactivo configurable
  const [showGeneratorOptions, setShowGeneratorOptions] = useState(false);
  const [genLength, setGenLength] = useState(16);
  const [genIncludeUppercase, setGenIncludeUppercase] = useState(true);
  const [genIncludeLowercase, setGenIncludeLowercase] = useState(true);
  const [genIncludeNumbers, setGenIncludeNumbers] = useState(true);
  const [genIncludeSymbols, setGenIncludeSymbols] = useState(true);
  const [previewGeneratedPass, setPreviewGeneratedPass] = useState('');

  // Inicializar campos según si es edición o nueva creación
  useEffect(() => {
    if (initialData) {
      setServiceName(initialData.serviceName || '');
      setUsername(initialData.username || '');
      setPassword(initialData.password || '');
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
    setShowGeneratorOptions(false);
  }, [initialData, visible]);

  // Generar preview cada vez que cambien las opciones del generador
  useEffect(() => {
    if (showGeneratorOptions) {
      generateCustomPassword();
    }
  }, [showGeneratorOptions, genLength, genIncludeUppercase, genIncludeLowercase, genIncludeNumbers, genIncludeSymbols]);

  // Función para generar contraseña según los caracteres que elija el usuario
  const generateCustomPassword = async () => {
    const generated = await PasswordGeneratorService.generatePassword({
      length: genLength,
      includeUppercase: genIncludeUppercase,
      includeLowercase: genIncludeLowercase,
      includeNumbers: genIncludeNumbers,
      includeSymbols: genIncludeSymbols,
    });
    setPreviewGeneratedPass(generated);
  };

  // Manejador para alternar tipos de caracteres (validando que al menos 1 esté activo)
  const handleToggleCharOption = (
    type: 'upper' | 'lower' | 'num' | 'sym',
    currentVal: boolean
  ) => {
    const nextVal = !currentVal;
    if (!nextVal) {
      const activeOptions = [
        type === 'upper' ? nextVal : genIncludeUppercase,
        type === 'lower' ? nextVal : genIncludeLowercase,
        type === 'num' ? nextVal : genIncludeNumbers,
        type === 'sym' ? nextVal : genIncludeSymbols,
      ].filter(Boolean).length;

      if (activeOptions === 0) {
        Alert.alert(
          'Requisito de caracteres',
          'Debes seleccionar al menos un tipo de caracter (mayúsculas, minúsculas, números o símbolos).'
        );
        return;
      }
    }

    if (type === 'upper') setGenIncludeUppercase(nextVal);
    if (type === 'lower') setGenIncludeLowercase(nextVal);
    if (type === 'num') setGenIncludeNumbers(nextVal);
    if (type === 'sym') setGenIncludeSymbols(nextVal);
  };

  // Aplicar la contraseña generada con los filtros del usuario
  const handleApplyGeneratedPassword = () => {
    if (previewGeneratedPass) {
      setPassword(previewGeneratedPass);
      setShowPassword(true);
      setShowGeneratorOptions(false);
    }
  };

  // Evaluación en tiempo real con zxcvbn-ts
  const evaluation = PasswordStrengthService.evaluate(password, [serviceName, username]);

  // Copiar al portapapeles
  const handleCopy = async () => {
    if (!password) return;
    await PasswordGeneratorService.copyToClipboard(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Guardar elemento de manera segura en la bóveda
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
      serviceName: serviceName.trim(),
      username: username.trim(),
      password,
      notes: notes.trim(),
      category,
      recommendedChangeDate: recommendedDate.toISOString(),
    });

    setSaving(false);
    if (success) {
      onClose();
    } else {
      Alert.alert('Error al guardar', 'No se pudo cifrar y guardar la contraseña. Verifica que tu bóveda esté desbloqueada.');
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
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
        edges={['top', 'bottom']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Cabecera del modal con botón Guardar directo arriba */}
          <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </Pressable>

            <View style={styles.headerTitleContainer}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                {initialData ? 'Editar Contraseña' : 'Nueva Contraseña'}
              </Text>
            </View>
          </View>

          {/* Formulario scrolleable */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
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

            {/* Campo: Contraseña con selector interactivo */}
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña *</Text>

              {/* Botón que permite configurar y generar los caracteres deseados */}
              <Pressable
                onPress={() => {
                  setShowGeneratorOptions(!showGeneratorOptions);
                  if (!showGeneratorOptions) {
                    generateCustomPassword();
                  }
                }}
                style={({ pressed }) => [
                  styles.actionLink,
                  {
                    backgroundColor: showGeneratorOptions
                      ? (isDark ? theme.primaryLight : '#DBEAFE')
                      : 'transparent',
                    borderColor: theme.primary,
                    borderWidth: 1,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={showGeneratorOptions ? 'chevron-up' : 'sparkles'}
                  size={14}
                  color={theme.primary}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.actionLinkText, { color: theme.primary }]}>
                  {showGeneratorOptions ? 'Ocultar opciones' : 'Generar contraseña'}
                </Text>
              </Pressable>
            </View>

            {/* Panel de configuración de caracteres a incluir en la contraseña generada */}
            {showGeneratorOptions && (
              <View
                style={[
                  styles.generatorPanel,
                  {
                    backgroundColor: isDark ? theme.cardSecondary : '#F1F5F9',
                    borderColor: theme.primary,
                  },
                ]}
              >
                <View style={styles.genPanelHeader}>
                  <Ionicons name="options-outline" size={18} color={theme.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.genPanelTitle, { color: theme.text }]}>
                    ¿Qué caracteres deseas incluir?
                  </Text>
                </View>
                <Text style={[styles.genPanelSubtitle, { color: theme.textMuted }]}>
                  Personaliza tu contraseña eligiendo los tipos de caracteres:
                </Text>

                {/* Opciones de caracteres con interruptores */}
                <View style={styles.switchesGrid}>
                  {/* Mayúsculas */}
                  <Pressable
                    onPress={() => handleToggleCharOption('upper', genIncludeUppercase)}
                    style={[
                      styles.switchItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: genIncludeUppercase ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.switchLabelContainer}>
                      <Text style={[styles.switchTitle, { color: theme.text }]}>Mayúsculas</Text>
                      <Text style={[styles.switchSample, { color: theme.textMuted }]}>A, B, C...</Text>
                    </View>
                    <Switch
                      value={genIncludeUppercase}
                      onValueChange={() => handleToggleCharOption('upper', genIncludeUppercase)}
                      trackColor={{ false: theme.cardSecondary, true: theme.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </Pressable>

                  {/* Minúsculas */}
                  <Pressable
                    onPress={() => handleToggleCharOption('lower', genIncludeLowercase)}
                    style={[
                      styles.switchItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: genIncludeLowercase ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.switchLabelContainer}>
                      <Text style={[styles.switchTitle, { color: theme.text }]}>Minúsculas</Text>
                      <Text style={[styles.switchSample, { color: theme.textMuted }]}>a, b, c...</Text>
                    </View>
                    <Switch
                      value={genIncludeLowercase}
                      onValueChange={() => handleToggleCharOption('lower', genIncludeLowercase)}
                      trackColor={{ false: theme.cardSecondary, true: theme.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </Pressable>

                  {/* Números */}
                  <Pressable
                    onPress={() => handleToggleCharOption('num', genIncludeNumbers)}
                    style={[
                      styles.switchItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: genIncludeNumbers ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.switchLabelContainer}>
                      <Text style={[styles.switchTitle, { color: theme.text }]}>Números</Text>
                      <Text style={[styles.switchSample, { color: theme.textMuted }]}>0, 1, 2...</Text>
                    </View>
                    <Switch
                      value={genIncludeNumbers}
                      onValueChange={() => handleToggleCharOption('num', genIncludeNumbers)}
                      trackColor={{ false: theme.cardSecondary, true: theme.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </Pressable>

                  {/* Símbolos */}
                  <Pressable
                    onPress={() => handleToggleCharOption('sym', genIncludeSymbols)}
                    style={[
                      styles.switchItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: genIncludeSymbols ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.switchLabelContainer}>
                      <Text style={[styles.switchTitle, { color: theme.text }]}>Símbolos</Text>
                      <Text style={[styles.switchSample, { color: theme.textMuted }]}>! @ # $...</Text>
                    </View>
                    <Switch
                      value={genIncludeSymbols}
                      onValueChange={() => handleToggleCharOption('sym', genIncludeSymbols)}
                      trackColor={{ false: theme.cardSecondary, true: theme.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </Pressable>
                </View>

                {/* Longitud rápida */}
                <View style={styles.lengthSelectionRow}>
                  <Text style={[styles.lengthTextLabel, { color: theme.textSecondary }]}>
                    Longitud: <Text style={{ color: theme.primary, fontWeight: '700' }}>{genLength} caracteres</Text>
                  </Text>
                  <View style={styles.lengthButtonsGroup}>
                    {[12, 16, 20, 24, 32].map((len) => (
                      <Pressable
                        key={len}
                        onPress={() => setGenLength(len)}
                        style={[
                          styles.miniLengthChip,
                          {
                            backgroundColor: genLength === len ? theme.primary : theme.card,
                            borderColor: genLength === len ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniLengthText,
                            { color: genLength === len ? '#FFFFFF' : theme.textSecondary },
                          ]}
                        >
                          {len}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Vista previa y botón para aplicar */}
                <View style={[styles.previewContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Text style={[styles.previewPasswordText, { color: theme.text }]} numberOfLines={1}>
                    {previewGeneratedPass || 'Generando...'}
                  </Text>
                  <Pressable
                    onPress={generateCustomPassword}
                    style={({ pressed }) => [
                      styles.previewRegenBtn,
                      { backgroundColor: theme.cardSecondary, opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <Ionicons name="refresh" size={16} color={theme.primary} />
                  </Pressable>
                </View>

                {/* Botón Aplicar */}
                <View style={{ marginTop: 10 }}>
                  <CustomButton
                    title="Usar esta contraseña generada"
                    onPress={handleApplyGeneratedPassword}
                    icon="checkmark-circle-outline"
                    size="sm"
                  />
                </View>
              </View>
            )}

            {/* Input de Contraseña principal con botón ver y copiar */}
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
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={({ pressed }) => [styles.iconAction, { opacity: pressed ? 0.6 : 1 }]}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textSecondary}
                  style={{ marginRight: 10 }}
                />
              </Pressable>
              {/* Copiar al portapapeles */}
              <Pressable
                onPress={handleCopy}
                style={({ pressed }) => [styles.iconAction, { opacity: pressed ? 0.6 : 1 }]}
              >
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

            {/* BOTÓN DE GUARDAR DIRECTAMENTE EN EL FORMULARIO (Siempre visible al desplazarse) */}
            <View style={styles.formSaveContainer}>
              <CustomButton
                title={initialData ? 'Guardar Cambios' : 'Guardar en mi Bóveda'}
                onPress={handleSave}
                loading={saving}
                icon="shield-checkmark"
                size="lg"
              />
              <CustomButton
                title="Cancelar y Salir"
                onPress={onClose}
                variant="secondary"
                style={{ marginTop: 8 }}
              />
            </View>
          </ScrollView>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  headerSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  generatorPanel: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginVertical: 10,
  },
  genPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  genPanelTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  genPanelSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  switchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchItem: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  switchLabelContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchSample: {
    fontSize: 10,
    marginTop: 1,
  },
  lengthSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  lengthTextLabel: {
    fontSize: 12,
  },
  lengthButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  miniLengthChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  miniLengthText: {
    fontSize: 11,
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  previewPasswordText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  previewRegenBtn: {
    padding: 6,
    borderRadius: 6,
    marginLeft: 6,
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
  formSaveContainer: {
    marginTop: 22,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
