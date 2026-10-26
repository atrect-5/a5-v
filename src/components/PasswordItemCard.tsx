import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordItem } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import { PasswordStrengthService } from '../services/passwordStrengthService';
import { PasswordGeneratorService } from '../services/passwordGeneratorService';
import { InteractiveCard } from './InteractiveCard';

interface PasswordItemCardProps {
  item: PasswordItem;
  onPress: () => void;
}

export const PasswordItemCard: React.FC<PasswordItemCardProps> = ({ item, onPress }) => {
  const { theme, isDark } = useThemeStore();
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Evaluación de seguridad
  const evaluation = PasswordStrengthService.evaluate(item.password, [
    item.serviceName,
    item.username,
  ]);

  // Chequeo de fecha recomendada de cambio
  const now = new Date().getTime();
  const changeTime = item.recommendedChangeDate ? new Date(item.recommendedChangeDate).getTime() : 0;
  const isExpired = changeTime > 0 && changeTime <= now;
  const isNearExpiry = changeTime > 0 && !isExpired && (changeTime - now) <= 7 * 24 * 60 * 60 * 1000;

  const handleCopyPassword = async () => {
    await PasswordGeneratorService.copyToClipboard(item.password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleCopyUser = async () => {
    await PasswordGeneratorService.copyToClipboard(item.username);
    setCopiedUser(true);
    setTimeout(() => setCopiedUser(false), 2000);
  };

  // Obtener letra inicial o icono para el servicio
  const initial = item.serviceName.charAt(0).toUpperCase() || 'P';

  return (
    <InteractiveCard onPress={onPress} interactive style={styles.card}>
      <View style={styles.header}>
        {/* Avatar de Servicio */}
        <View style={[styles.avatar, { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight }]}>
          <Text style={[styles.avatarText, { color: theme.primary }]}>{initial}</Text>
        </View>

        {/* Información principal */}
        <View style={styles.info}>
          <Text style={[styles.serviceName, { color: theme.text }]} numberOfLines={1}>
            {item.serviceName}
          </Text>
          <Text style={[styles.username, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.username}
          </Text>
        </View>

        {/* Badge de seguridad */}
        <View style={[styles.scoreBadge, { backgroundColor: evaluation.color + '20' }]}>
          <View style={[styles.scoreDot, { backgroundColor: evaluation.color }]} />
          <Text style={[styles.scoreBadgeText, { color: evaluation.color }]}>
            {evaluation.label}
          </Text>
        </View>
      </View>

      {/* Contraseña oculta / visible */}
      <View style={[styles.passwordBox, { backgroundColor: theme.cardSecondary }]}>
        <Text
          style={[styles.passwordText, { color: theme.text }]}
          numberOfLines={1}
        >
          {showPassword ? item.password : '••••••••••••••••'}
        </Text>

        <View style={styles.actionsGroup}>
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={theme.textSecondary}
              style={{ marginRight: 10 }}
            />
          </Pressable>

          <Pressable
            onPress={handleCopyPassword}
            style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons
              name={copiedPass ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color={copiedPass ? theme.success : theme.primary}
            />
          </Pressable>
        </View>
      </View>

      {/* Fechas e indicadores de caducidad */}
      <View style={styles.footerRow}>
        {isExpired ? (
          <View style={styles.alertRow}>
            <Ionicons name="alert-circle" size={14} color={theme.danger} style={{ marginRight: 4 }} />
            <Text style={[styles.expiryText, { color: theme.danger }]}>
              Cambio de clave recomendado (Vencida)
            </Text>
          </View>
        ) : isNearExpiry ? (
          <View style={styles.alertRow}>
            <Ionicons name="time-outline" size={14} color={theme.warning} style={{ marginRight: 4 }} />
            <Text style={[styles.expiryText, { color: theme.warning }]}>
              Próxima a vencer recomendada
            </Text>
          </View>
        ) : (
          <View style={styles.alertRow}>
            <Ionicons name="shield-checkmark-outline" size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.expiryText, { color: theme.textMuted }]}>
              Actualizado: {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleCopyUser}
          style={({ pressed }) => [
            styles.copyUserBadge,
            { backgroundColor: isDark ? theme.border : theme.cardSecondary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons
            name={copiedUser ? 'checkmark' : 'person-outline'}
            size={12}
            color={copiedUser ? theme.success : theme.textSecondary}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.copyUserText, { color: copiedUser ? theme.success : theme.textSecondary }]}>
            {copiedUser ? 'Copiado' : 'Copiar usuario'}
          </Text>
        </Pressable>
      </View>
    </InteractiveCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  passwordText: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 14,
    letterSpacing: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expiryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  copyUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  copyUserText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
