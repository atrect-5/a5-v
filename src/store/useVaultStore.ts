import { create } from 'zustand';
import { PasswordItem, VaultStats } from '../types';
import { SecureStorageService } from '../services/secureStorageService';
import { CryptoService } from '../services/cryptoService';
import { BiometricService } from '../services/biometricService';
import { PasswordStrengthService } from '../services/passwordStrengthService';

interface VaultState {
  isUnlocked: boolean;
  hasMasterPassword: boolean;
  masterKey: string | null;
  passwords: PasswordItem[];
  searchQuery: string;
  selectedCategory: string | null;
  isLoading: boolean;
  isBiometricsEnabled: boolean;
  canUseBiometrics: boolean;
  biometricType: string;

  // Acciones de autenticación
  checkInitialStatus: () => Promise<void>;
  setupMasterPassword: (password: string) => Promise<boolean>;
  unlockWithMasterPassword: (password: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockVault: () => void;
  changeMasterPassword: (oldPass: string, newPass: string) => Promise<boolean>;
  toggleBiometrics: (enable: boolean) => Promise<boolean>;

  // Acciones de gestión de contraseñas
  loadVaultData: () => Promise<void>;
  addPassword: (item: {
    serviceName: string;
    username: string;
    password: string;
    notes?: string;
    recommendedChangeDate?: string;
    category?: PasswordItem['category'];
  }) => Promise<boolean>;
  updatePassword: (id: string, updates: Partial<Omit<PasswordItem, 'id' | 'createdAt'>>) => Promise<boolean>;
  deletePassword: (id: string) => Promise<boolean>;

  // Filtros y estadísticas
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string | null) => void;
  getFilteredPasswords: () => PasswordItem[];
  getVaultStats: () => VaultStats;
}

export const useVaultStore = create<VaultState>((set, get) => ({
  isUnlocked: false,
  hasMasterPassword: false,
  masterKey: null,
  passwords: [],
  searchQuery: '',
  selectedCategory: null,
  isLoading: true,
  isBiometricsEnabled: false,
  canUseBiometrics: false,
  biometricType: 'Biometría',

  checkInitialStatus: async () => {
    set({ isLoading: true });
    try {
      const hasPass = await SecureStorageService.hasMasterPassword();
      const hwAvail = await BiometricService.isHardwareAvailable();
      const enrolled = await BiometricService.isEnrolled();
      const bioEnabled = await SecureStorageService.isBiometricsEnabled();
      const bioType = await BiometricService.getSupportedTypes();

      set({
        hasMasterPassword: hasPass,
        canUseBiometrics: hwAvail && enrolled,
        isBiometricsEnabled: bioEnabled && hwAvail && enrolled,
        biometricType: bioType,
        isLoading: false,
      });
    } catch (e) {
      console.error('Error al verificar estado inicial:', e);
      set({ isLoading: false });
    }
  },

  setupMasterPassword: async (password: string) => {
    set({ isLoading: true });
    const success = await SecureStorageService.setupMasterPassword(password);
    if (success) {
      set({
        hasMasterPassword: true,
        masterKey: password,
        isUnlocked: true,
        passwords: [],
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
    return success;
  },

  unlockWithMasterPassword: async (password: string) => {
    set({ isLoading: true });
    const isValid = await SecureStorageService.verifyMasterPassword(password);
    if (!isValid) {
      set({ isLoading: false });
      return false;
    }

    const items = await SecureStorageService.loadVaultItems(password);
    if (items === null) {
      set({ isLoading: false });
      return false;
    }

    set({
      isUnlocked: true,
      masterKey: password,
      passwords: items,
      isLoading: false,
    });
    return true;
  },

  unlockWithBiometrics: async () => {
    const { isBiometricsEnabled, canUseBiometrics } = get();
    if (!isBiometricsEnabled || !canUseBiometrics) return false;

    const authenticated = await BiometricService.authenticate('Desbloquear tu gestor seguro');
    if (!authenticated) return false;

    const storedKey = await SecureStorageService.getBiometricVaultKey();
    if (!storedKey) return false;

    return await get().unlockWithMasterPassword(storedKey);
  },

  lockVault: () => {
    set({
      isUnlocked: false,
      masterKey: null,
      passwords: [],
      searchQuery: '',
      selectedCategory: null,
    });
  },

  changeMasterPassword: async (oldPass: string, newPass: string) => {
    const success = await SecureStorageService.changeMasterPassword(oldPass, newPass);
    if (success) {
      set({ masterKey: newPass });
    }
    return success;
  },

  toggleBiometrics: async (enable: boolean) => {
    const { masterKey, canUseBiometrics } = get();
    if (enable && !canUseBiometrics) return false;

    if (enable && masterKey) {
      const auth = await BiometricService.authenticate('Confirma para habilitar biometría');
      if (!auth) return false;
      await SecureStorageService.setBiometricsEnabled(true, masterKey);
      set({ isBiometricsEnabled: true });
      return true;
    } else {
      await SecureStorageService.setBiometricsEnabled(false);
      set({ isBiometricsEnabled: false });
      return true;
    }
  },

  loadVaultData: async () => {
    const { masterKey } = get();
    if (!masterKey) return;
    const items = await SecureStorageService.loadVaultItems(masterKey);
    if (items) {
      set({ passwords: items });
    }
  },

  addPassword: async (item) => {
    const { masterKey, passwords } = get();
    if (!masterKey) return false;

    const now = new Date();
    // Por defecto, fecha recomendada de cambio a los 90 días si no se especifica
    const defaultChangeDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const newItem: PasswordItem = {
      id: CryptoService.generateId(),
      serviceName: item.serviceName.trim(),
      username: item.username.trim(),
      password: item.password,
      notes: item.notes?.trim() || '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      recommendedChangeDate: item.recommendedChangeDate || defaultChangeDate.toISOString(),
      category: item.category || 'general',
    };

    const updatedList = [newItem, ...passwords];
    const saved = await SecureStorageService.saveVaultItems(updatedList, masterKey);
    if (saved) {
      set({ passwords: updatedList });
      return true;
    }
    return false;
  },

  updatePassword: async (id, updates) => {
    const { masterKey, passwords } = get();
    if (!masterKey) return false;

    const now = new Date().toISOString();
    const updatedList = passwords.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          updatedAt: now,
        };
      }
      return p;
    });

    const saved = await SecureStorageService.saveVaultItems(updatedList, masterKey);
    if (saved) {
      set({ passwords: updatedList });
      return true;
    }
    return false;
  },

  deletePassword: async (id) => {
    const { masterKey, passwords } = get();
    if (!masterKey) return false;

    const updatedList = passwords.filter((p) => p.id !== id);
    const saved = await SecureStorageService.saveVaultItems(updatedList, masterKey);
    if (saved) {
      set({ passwords: updatedList });
      return true;
    }
    return false;
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

  getFilteredPasswords: () => {
    const { passwords, searchQuery, selectedCategory } = get();
    const query = searchQuery.toLowerCase().trim();

    return passwords.filter((p) => {
      const matchesSearch =
        !query ||
        p.serviceName.toLowerCase().includes(query) ||
        p.username.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query));

      const matchesCategory =
        !selectedCategory || p.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  },

  getVaultStats: (): VaultStats => {
    const { passwords } = get();
    const now = new Date().getTime();

    let weakCount = 0;
    const passwordFrequencies = new Map<string, number>();
    let expiredCount = 0;

    passwords.forEach((item) => {
      // 1. Fuerza
      const evalResult = PasswordStrengthService.evaluate(item.password, [item.serviceName, item.username]);
      if (evalResult.score <= 1) {
        weakCount++;
      }

      // 2. Frecuencia de contraseñas reutilizadas
      const count = passwordFrequencies.get(item.password) || 0;
      passwordFrequencies.set(item.password, count + 1);

      // 3. Expiradas o que vencieron su fecha recomendada de cambio
      if (item.recommendedChangeDate) {
        const changeTime = new Date(item.recommendedChangeDate).getTime();
        if (changeTime <= now) {
          expiredCount++;
        }
      }
    });

    let reusedCount = 0;
    passwordFrequencies.forEach((count) => {
      if (count > 1) {
        reusedCount += count;
      }
    });

    return {
      total: passwords.length,
      weakCount,
      reusedCount,
      expiredCount,
    };
  },
}));
