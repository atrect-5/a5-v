import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useVaultStore } from '../store/useVaultStore';
import { PasswordStrengthService } from '../services/passwordStrengthService';
import { HeaderBar } from '../components/HeaderBar';
import { StrengthIndicator } from '../components/StrengthIndicator';
import { InteractiveCard } from '../components/InteractiveCard';

export const AuditorScreen: React.FC = () => {
  const { theme, isDark } = useThemeStore();
  const { passwords, getVaultStats } = useVaultStore();

  const [testPassword, setTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(false);

  const stats = getVaultStats();
  const testEvaluation = PasswordStrengthService.evaluate(testPassword);

  // Identificar contraseñas vulnerables en la bóveda
  const weakItems = passwords.filter((p) => {
    const ev = PasswordStrengthService.evaluate(p.password, [p.serviceName, p.username]);
    return ev.score <= 1;
  });

  const now = new Date().getTime();
  const expiredItems = passwords.filter((p) => {
    if (!p.recommendedChangeDate) return false;
    return new Date(p.recommendedChangeDate).getTime() <= now;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar
        title="Auditoría y Seguridad"
        subtitle="Verificador de fuerza con algoritmo zxcvbn"
        showLock={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Resumen de Salud de la Bóveda */}
        <View style={styles.statsGrid}>
          <InteractiveCard style={[styles.statCard, { flex: 1 }]}>
            <Ionicons name="key" size={24} color={theme.primary} />
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Claves</Text>
          </InteractiveCard>

          <InteractiveCard style={[styles.statCard, { flex: 1 }]}>
            <Ionicons
              name="shield-outline"
              size={24}
              color={stats.weakCount > 0 ? theme.danger : theme.success}
            />
            <Text
              style={[
                styles.statValue,
                { color: stats.weakCount > 0 ? theme.danger : theme.success },
              ]}
            >
              {stats.weakCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Débiles</Text>
          </InteractiveCard>

          <InteractiveCard style={[styles.statCard, { flex: 1 }]}>
            <Ionicons
              name="copy-outline"
              size={24}
              color={stats.reusedCount > 0 ? theme.warning : theme.success}
            />
            <Text
              style={[
                styles.statValue,
                { color: stats.reusedCount > 0 ? theme.warning : theme.success },
              ]}
            >
              {stats.reusedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Reutilizadas</Text>
          </InteractiveCard>

          <InteractiveCard style={[styles.statCard, { flex: 1 }]}>
            <Ionicons
              name="time-outline"
              size={24}
              color={stats.expiredCount > 0 ? theme.danger : theme.success}
            />
            <Text
              style={[
                styles.statValue,
                { color: stats.expiredCount > 0 ? theme.danger : theme.success },
              ]}
            >
              {stats.expiredCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Por Renovar</Text>
          </InteractiveCard>
        </View>

        {/* Sección: Verificador Interactivo de Cualquier Contraseña */}
        <View style={[styles.checkerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Verificador en tiempo real
            </Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
            Escribe cualquier contraseña para calcular su resistencia frente a ataques de fuerza bruta y diccionarios:
          </Text>

          <View style={[styles.inputContainer, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text, fontFamily: 'monospace' }]}
              placeholder="Ingresa una clave para evaluarla..."
              placeholderTextColor={theme.textMuted}
              value={testPassword}
              onChangeText={setTestPassword}
              secureTextEntry={!showTestPassword}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowTestPassword(!showTestPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showTestPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
            {testPassword.length > 0 && (
              <Pressable onPress={() => setTestPassword('')} style={styles.eyeBtn}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Resultado de la evaluación */}
          {testPassword.length > 0 ? (
            <View style={{ marginTop: 12 }}>
              <StrengthIndicator evaluation={testEvaluation} showDetails={true} />
            </View>
          ) : (
            <View style={[styles.placeholderBox, { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight }]}>
              <Ionicons name="bulb-outline" size={18} color={theme.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                Consejo: Una buena contraseña tiene 16+ caracteres y combina palabras aleatorias.
              </Text>
            </View>
          )}
        </View>

        {/* Alertas de Contraseñas Débiles en la Bóveda */}
        {weakItems.length > 0 && (
          <View style={[styles.alertCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={20} color={theme.danger} style={{ marginRight: 8 }} />
              <Text style={[styles.alertTitle, { color: theme.danger }]}>
                {weakItems.length} contraseñas vulnerables detectadas
              </Text>
            </View>
            <Text style={[styles.alertDesc, { color: theme.textMuted }]}>
              Se recomienda cambiarlas por contraseñas generadas aleatoriamente:
            </Text>
            {weakItems.map((item) => (
              <View
                key={item.id}
                style={[styles.vulnerableRow, { borderBottomColor: theme.border }]}
              >
                <View>
                  <Text style={[styles.vulnerableService, { color: theme.text }]}>
                    {item.serviceName}
                  </Text>
                  <Text style={[styles.vulnerableUser, { color: theme.textSecondary }]}>
                    {item.username}
                  </Text>
                </View>
                <View style={[styles.weakBadge, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={styles.weakBadgeText}>Débil</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Alertas de Contraseñas con cambio recomendado vencido */}
        {expiredItems.length > 0 && (
          <View style={[styles.alertCard, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 14 }]}>
            <View style={styles.alertHeader}>
              <Ionicons name="time" size={20} color={theme.warning} style={{ marginRight: 8 }} />
              <Text style={[styles.alertTitle, { color: theme.warning }]}>
                {expiredItems.length} contraseñas con renovación recomendada
              </Text>
            </View>
            {expiredItems.map((item) => (
              <View
                key={item.id}
                style={[styles.vulnerableRow, { borderBottomColor: theme.border }]}
              >
                <View>
                  <Text style={[styles.vulnerableService, { color: theme.text }]}>
                    {item.serviceName}
                  </Text>
                  <Text style={[styles.vulnerableUser, { color: theme.textSecondary }]}>
                    {item.username}
                  </Text>
                </View>
                <View style={[styles.weakBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.weakBadgeText, { color: '#B45309' }]}>Vencida</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  checkerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  eyeBtn: {
    padding: 6,
  },
  placeholderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  placeholderText: {
    fontSize: 12,
    flex: 1,
  },
  alertCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  alertDesc: {
    fontSize: 12,
    marginBottom: 10,
  },
  vulnerableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  vulnerableService: {
    fontSize: 14,
    fontWeight: '700',
  },
  vulnerableUser: {
    fontSize: 12,
  },
  weakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  weakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B91C1C',
  },
});
