import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVaultStore } from '../store/useVaultStore';
import { useThemeStore } from '../store/useThemeStore';
import { PasswordItem } from '../types';
import { HeaderBar } from '../components/HeaderBar';
import { PasswordItemCard } from '../components/PasswordItemCard';
import { PasswordModal } from '../components/PasswordModal';
import { CustomButton } from '../components/CustomButton';

export const VaultScreen: React.FC = () => {
  const { theme, isDark } = useThemeStore();
  const {
    getFilteredPasswords,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    addPassword,
    updatePassword,
    deletePassword,
    getVaultStats,
  } = useVaultStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PasswordItem | null>(null);

  const filteredPasswords = getFilteredPasswords();
  const stats = getVaultStats();

  const categories = [
    { id: null, label: 'Todas' },
    { id: 'general', label: 'General' },
    { id: 'social', label: 'Social' },
    { id: 'email', label: 'Email' },
    { id: 'work', label: 'Trabajo' },
    { id: 'finance', label: 'Finanzas' },
  ];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (item: PasswordItem) => {
    Alert.alert(
      item.serviceName,
      `Usuario: ${item.username}\nCreado: ${new Date(item.createdAt).toLocaleDateString()}\nNotas: ${item.notes || 'Sin notas'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(item),
        },
        {
          text: 'Editar',
          onPress: () => {
            setEditingItem(item);
            setModalVisible(true);
          },
        },
      ]
    );
  };

  const confirmDelete = (item: PasswordItem) => {
    Alert.alert(
      '¿Eliminar contraseña?',
      `Esta acción borrará permanentemente las credenciales de "${item.serviceName}".`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deletePassword(item.id);
          },
        },
      ]
    );
  };

  const handleSavePassword = async (itemData: {
    serviceName: string;
    username: string;
    password: string;
    notes?: string;
    recommendedChangeDate?: string;
    category?: PasswordItem['category'];
  }) => {
    if (editingItem) {
      return await updatePassword(editingItem.id, itemData);
    } else {
      return await addPassword(itemData);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HeaderBar
        title="Bóveda de Claves"
        subtitle={`${stats.total} contraseñas cifradas localmente`}
        showLock={true}
      />

      {/* Barra de Búsqueda */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar por servicio, usuario o notas..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filtro por Categorías */}
      <View style={styles.categoryScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.label}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <Pressable
                onPress={() => setSelectedCategory(item.id)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Lista de Contraseñas */}
      <FlatList
        data={filteredPasswords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <PasswordItemCard item={item} onPress={() => handleOpenEdit(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight },
              ]}
            >
              <Ionicons name="key-outline" size={40} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {searchQuery ? 'Sin resultados para la búsqueda' : 'Bóveda vacía'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {searchQuery
                ? 'Prueba buscando con otro término o limpiando el filtro.'
                : 'Empieza agregando tu primera contraseña segura cifrada con AES-256.'}
            </Text>
            {!searchQuery && (
              <View style={{ marginTop: 20 }}>
                <CustomButton
                  title="Agregar mi primera clave"
                  onPress={handleOpenCreate}
                  icon="add"
                />
              </View>
            )}
          </View>
        }
      />

      {/* Botón flotante para agregar contraseña */}
      {filteredPasswords.length > 0 && (
        <View style={styles.fabContainer}>
          <Pressable
            onPress={handleOpenCreate}
            style={({ pressed }) => [
              styles.fabButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              },
            ]}
          >
            <Ionicons name="add" size={28} color={isDark ? "#FFFFFF" : "#000000"} />
          </Pressable>
        </View>
      )}

      {/* Modal para crear o editar */}
      <PasswordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSavePassword}
        initialData={editingItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
  },
  fabButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
