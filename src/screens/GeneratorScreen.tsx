import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useVaultStore } from '../store/useVaultStore';
import { PasswordGeneratorService } from '../services/passwordGeneratorService';
import { PasswordStrengthService } from '../services/passwordStrengthService';
import { HeaderBar } from '../components/HeaderBar';
import { CustomButton } from '../components/CustomButton';
import { StrengthIndicator } from '../components/StrengthIndicator';
import { PasswordModal } from '../components/PasswordModal';

export const GeneratorScreen: React.FC = () => {
  const { theme, isDark } = useThemeStore();
  const { addPassword } = useVaultStore();

  const [length, setLength] = useState(18);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  // Generar al cargar o cuando cambien las opciones
  const generateNewPassword = async () => {
    const pass = await PasswordGeneratorService.generatePassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    });
    setGeneratedPassword(pass);
    setCopied(false);
  };

  useEffect(() => {
    generateNewPassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const handleCopy = async () => {
    if (!generatedPassword) return;
    await PasswordGeneratorService.copyToClipboard(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLengthChange = (delta: number) => {
    setLength((prev) => Math.max(8, Math.min(128, prev + delta)));
  };

  // Evaluación zxcvbn-ts de la contraseña generada
  const evaluation = PasswordStrengthService.evaluate(generatedPassword);

  const quickPresets = [12, 16, 20, 24, 32, 64];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar
        title="Generador Seguro"
        subtitle="Genera claves aleatorias de 8 a 128 caracteres"
        showLock={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tarjeta de visualización de contraseña generada */}
        <View style={[styles.displayCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.passwordDisplay, { color: theme.text }]} selectable>
            {generatedPassword}
          </Text>

          <View style={styles.cardActionsRow}>
            {/* Botón Regenerar */}
            <Pressable
              onPress={generateNewPassword}
              style={({ pressed }) => [
                styles.iconButton,
                {
                  backgroundColor: theme.cardSecondary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="refresh" size={20} color={theme.primary} style={{ marginRight: 50 }} />
            </Pressable>

            {/* Botón Copiar al Portapapeles con feedback */}
            <Pressable
              onPress={handleCopy}
              style={({ pressed }) => [
                styles.copyButton,
                {
                  backgroundColor: copied ? theme.success : theme.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons
                name={copied ? 'checkmark-circle' : 'copy-outline'}
                size={20}
                color={copied ? theme.success : theme.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* Medidor de Fuerza de la contraseña generada */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Nivel de Seguridad</Text>
          <StrengthIndicator evaluation={evaluation} showDetails={true} />
        </View>

        {/* Control de Longitud (8 a 128) */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.lengthHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
              Longitud de la contraseña
            </Text>
            <View style={[styles.lengthBadge, { backgroundColor: isDark ? theme.primaryLight : '#DBEAFE' }]}>
              <Text style={[styles.lengthBadgeText, { color: theme.primary }]}>
                {length} caracteres
              </Text>
            </View>
          </View>

          {/* Botones de ajuste fino */}
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => handleLengthChange(-1)}
              style={({ pressed }) => [
                styles.stepperButton,
                { backgroundColor: theme.cardSecondary, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="remove" size={20} color={theme.text} />
            </Pressable>

            <View style={styles.stepperValue}>
              <Text style={[styles.stepperText, { color: theme.text }]}>{length}</Text>
            </View>

            <Pressable
              onPress={() => handleLengthChange(1)}
              style={({ pressed }) => [
                styles.stepperButton,
                { backgroundColor: theme.cardSecondary, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="add" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Accesos rápidos de longitud */}
          <View style={styles.presetsRow}>
            {quickPresets.map((preset) => (
              <Pressable
                key={preset}
                onPress={() => setLength(preset)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: length === preset ? theme.primary : theme.cardSecondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    {
                      color: length === preset ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: length === preset ? '700' : '500',
                    },
                  ]}
                >
                  {preset}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Parámetros de caracteres (Mayúsculas, Minúsculas, Números, Símbolos) */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Conjunto de Caracteres</Text>

          {/* Mayúsculas */}
          <View style={[styles.optionRow, { borderBottomColor: theme.border }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Mayúsculas</Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>A, B, C, D...</Text>
            </View>
            <Switch
              value={includeUppercase}
              onValueChange={setIncludeUppercase}
              trackColor={{ false: theme.cardSecondary, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Minúsculas */}
          <View style={[styles.optionRow, { borderBottomColor: theme.border }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Minúsculas</Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>a, b, c, d...</Text>
            </View>
            <Switch
              value={includeLowercase}
              onValueChange={setIncludeLowercase}
              trackColor={{ false: theme.cardSecondary, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Números */}
          <View style={[styles.optionRow, { borderBottomColor: theme.border }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Números</Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>0, 1, 2, 3...</Text>
            </View>
            <Switch
              value={includeNumbers}
              onValueChange={setIncludeNumbers}
              trackColor={{ false: theme.cardSecondary, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Símbolos */}
          <View style={[styles.optionRow, { borderBottomWidth: 0 }]}>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Símbolos especiales</Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>! @ # $ % & *</Text>
            </View>
            <Switch
              value={includeSymbols}
              onValueChange={setIncludeSymbols}
              trackColor={{ false: theme.cardSecondary, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Botón directo para Guardar en la Bóveda */}
        <View style={{ marginTop: 8, marginBottom: 20 }}>
          <CustomButton
            title="Guardar esta clave en mi Bóveda"
            onPress={() => setSaveModalVisible(true)}
            icon="shield-checkmark"
            size="lg"
          />
        </View>
      </ScrollView>

      {/* Modal para guardar la clave generada */}
      <PasswordModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        onSave={async (itemData) => {
          return await addPassword(itemData);
        }}
        initialData={{
          id: '',
          serviceName: '',
          username: '',
          password: generatedPassword,
          notes: '',
          createdAt: '',
          updatedAt: '',
          recommendedChangeDate: '',
        }}
      />
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
  displayCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  passwordDisplay: {
    fontSize: 20,
    fontFamily: 'monospace',
    letterSpacing: 1,
    lineHeight: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 14,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  lengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  lengthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lengthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    marginHorizontal: 24,
    minWidth: 40,
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 24,
    fontWeight: '800',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  presetText: {
    fontSize: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
  },
});
