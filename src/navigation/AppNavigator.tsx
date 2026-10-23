import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useVaultStore } from '../store/useVaultStore';
import { useThemeStore } from '../store/useThemeStore';

import { AuthScreen } from '../screens/AuthScreen';
import { VaultScreen } from '../screens/VaultScreen';
import { GeneratorScreen } from '../screens/GeneratorScreen';
import { AuditorScreen } from '../screens/AuditorScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  const { isUnlocked, isLoading, checkInitialStatus } = useVaultStore();
  const { theme, isDark, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkInitialStatus();
  }, []);

  // Pantalla de carga mientras se verifican credenciales y preferencias
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Si la bóveda no está desbloqueada, mostramos la pantalla de autenticación
  if (!isUnlocked) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Vault') {
              iconName = focused ? 'key' : 'key-outline';
            } else if (route.name === 'Generator') {
              iconName = focused ? 'sparkles' : 'sparkles-outline';
            } else if (route.name === 'Auditor') {
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            } else {
              iconName = 'ellipse';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Vault"
          component={VaultScreen}
          options={{ tabBarLabel: 'Bóveda' }}
        />
        <Tab.Screen
          name="Generator"
          component={GeneratorScreen}
          options={{ tabBarLabel: 'Generador' }}
        />
        <Tab.Screen
          name="Auditor"
          component={AuditorScreen}
          options={{ tabBarLabel: 'Auditoría' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Ajustes' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
