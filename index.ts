// Polyfill para Web Crypto API en React Native / Expo Go antes de importar cualquier otra librería (necesario para crypto-js y uuid)
import 'react-native-get-random-values';
import * as Crypto from 'expo-crypto';

if (typeof (globalThis as any).crypto !== 'object') {
  (globalThis as any).crypto = {};
}
if (typeof (globalThis as any).crypto.getRandomValues !== 'function') {
  (globalThis as any).crypto.getRandomValues = (array: any) => Crypto.getRandomValues(array);
}

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
