import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
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

  const themeScaleAnim = useRef(new Animated.Value(1)).current;
  const lockScaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 0.90,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = (anim: Animated.Value) => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

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
        <Animated.View style={{ transform: [{ scale: themeScaleAnim }] }}>
          <Pressable
            onPress={toggleTheme}
            onPressIn={() => handlePressIn(themeScaleAnim)}
            onPressOut={() => handlePressOut(themeScaleAnim)}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: isDark
                  ? (pressed ? '#271C4E' : '#1C153A')
                  : (pressed ? '#E0EDFE' : '#FFFFFF'),
                borderColor: isDark ? '#4A367E' : '#BFDBFE',
                shadowColor: isDark ? '#8B5CF6' : '#2563EB',
              },
            ]}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={20}
              color={isDark ? '#C084FC' : '#2563EB'}
              style={{ marginRight: 5 }}
            />
          </Pressable>
        </Animated.View>

        {/* Bloqueo rápido de la bóveda */}
        {showLock && isUnlocked && (
          <Animated.View style={{ transform: [{ scale: lockScaleAnim }], marginLeft: 10 }}>
            <Pressable
              onPress={lockVault}
              onPressIn={() => handlePressIn(lockScaleAnim)}
              onPressOut={() => handlePressOut(lockScaleAnim)}
              accessibilityRole="button"
              accessibilityLabel="Bloquear bóveda de contraseñas"
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: isDark
                    ? (pressed ? '#381622' : '#26121B')
                    : (pressed ? '#FEE2E2' : '#FEF2F2'),
                  borderColor: isDark ? '#6B2230' : '#FECACA',
                  shadowColor: '#DC2626',
                },
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={19}
                color={isDark ? '#F87171' : '#DC2626'}
              />
            </Pressable>
          </Animated.View>
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
    marginRight: 12,
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
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
});
