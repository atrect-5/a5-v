import './global.css';
import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';

export default function App() {
  const { isDark, theme } = useThemeStore();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'left', 'right']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
