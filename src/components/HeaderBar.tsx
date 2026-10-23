import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';
import { useVaultStore } from '../store/useVaultStore';

interface HeaderBarProps {
  title: string;
  subtitle?: string;
  showLock?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  subtitle,
  showLock = true,
}) => {
  const { theme, isDark, toggleTheme } = useThemeStore();
  const { lockVault, isUnlocked } = useVaultStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        {/* Alternar tema Claro (Azul) / Oscuro (Morado) */}
        <Pressable
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: theme.cardSecondary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={theme.primary}
          />
        </Pressable>

        {/* Bloqueo rápido de la bóveda */}
        {showLock && isUnlocked && (
          <Pressable
            onPress={lockVault}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: theme.cardSecondary,
                opacity: pressed ? 0.7 : 1,
                marginLeft: 10,
              },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={20} color={theme.danger} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
