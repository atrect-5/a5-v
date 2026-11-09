import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordItem } from '../types';
import { useThemeStore } from '../store/useThemeStore';
import { PasswordGeneratorService } from '../services/passwordGeneratorService';
import { PasswordStrengthService } from '../services/passwordStrengthService';
import { CustomButton } from './CustomButton';

interface PasswordDetailModalProps {
  visible: boolean;
  item: PasswordItem | null;
  onClose: () => void;
  onEdit: (item: PasswordItem) => void;
  onDelete: (item: PasswordItem) => void;
}

export const PasswordDetailModal: React.FC<PasswordDetailModalProps> = ({
  visible,
  item,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { theme, isDark } = useThemeStore();
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Reiniciar estados cada vez que se abre el modal con un nuevo ítem
  useEffect(() => {
    if (visible) {
      setShowPassword(false);
      setCopiedPass(false);
      setCopiedUser(false);
      setIsConfirmingDelete(false);
    }
  }, [visible, item]);

  if (!item) return null;

  const initial = item.serviceName.charAt(0).toUpperCase() || 'P';
  const evaluation = PasswordStrengthService.evaluate(item.password, [
    item.serviceName,
    item.username,
  ]);

  // Chequeo de fecha recomendada de expiración
  const now = new Date().getTime();
  const changeTime = item.recommendedChangeDate ? new Date(item.recommendedChangeDate).getTime() : 0;
  const isExpired = changeTime > 0 && changeTime <= now;
  const isNearExpiry = changeTime > 0 && !isExpired && changeTime - now <= 7 * 24 * 60 * 60 * 1000;

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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Fondo oscuro clickeable para cerrar */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Hoja modal inferior / Bottom Sheet */}
        <View
          style={[
            styles.sheetContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {/* Indicador de arrastre / barra decorativa */}
          <View style={[styles.dragIndicator, { backgroundColor: theme.border }]} />

          {isConfirmingDelete ? (
            /* Vista de confirmación de eliminación con diseño moderno */
            <View style={styles.confirmDeleteContainer}>
              <View
                style={[
                  styles.warningIconCircle,
                  { backgroundColor: theme.dangerLight },
                ]}
              >
                <Ionicons name="trash-outline" size={32} color={theme.danger} />
              </View>

              <Text style={[styles.confirmTitle, { color: theme.text }]}>
                ¿Eliminar esta contraseña?
              </Text>

              <Text style={[styles.confirmMessage, { color: theme.textSecondary }]}>
                Se eliminarán permanentemente las credenciales guardadas para{' '}
                <Text style={{ fontWeight: '700', color: theme.text }}>
                  {item.serviceName}
                </Text>
                . Esta acción no se puede deshacer.
              </Text>

              <View style={styles.confirmActionsRow}>

                <CustomButton
                  title='Cancelar'
                  onPress={() => setIsConfirmingDelete(false)}
                  variant='secondary'
                  containerStyle={{ flex: 1 }}
                />

                <CustomButton
                  title='Eliminar'
                  icon='trash'
                  onPress={() => onDelete(item)}
                  variant='danger'
                  containerStyle={{ flex: 1 }}
                />



              </View>
            </View>
          ) : (
            /* Vista principal detallada del elemento */
            <>
              {/* Cabecera del modal */}
              <View style={styles.headerRow}>
                <View style={styles.serviceHeaderInfo}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isDark ? theme.cardSecondary : theme.primaryLight },
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                      {initial}
                    </Text>
                  </View>

                  <View style={styles.titleWrapper}>
                    <Text style={[styles.serviceTitle, { color: theme.text }]} numberOfLines={1}>
                      {item.serviceName}
                    </Text>
                    {item.category && (
                      <View style={[styles.categoryBadge, { backgroundColor: theme.cardSecondary }]}>
                        <Text style={[styles.categoryText, { color: theme.primary }]}>
                          {item.category.toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    { backgroundColor: theme.cardSecondary, opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="close" size={20} color={theme.textSecondary} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Caja de Usuario */}
                <View style={[styles.fieldCard, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}>
                  <View style={styles.fieldHeader}>
                    <View style={styles.fieldTitleRow}>
                      <Ionicons name="person-outline" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                        Usuario / Correo
                      </Text>
                    </View>
                    <Pressable
                      onPress={handleCopyUser}
                      style={({ pressed }) => [
                        styles.copyPill,
                        {
                          backgroundColor: copiedUser ? theme.successLight : theme.card,
                          borderColor: copiedUser ? theme.success : theme.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Ionicons
                        name={copiedUser ? 'checkmark-circle' : 'copy-outline'}
                        size={18}
                        color={copiedUser ? theme.success : theme.primary}
                        style={{ marginRight: 4 }}
                      />
                    </Pressable>
                  </View>
                  <Text style={[styles.fieldValue, { color: theme.text }]} selectable>
                    {item.username}
                  </Text>
                </View>

                {/* Caja de Contraseña */}
                <View style={[styles.fieldCard, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}>
                  <View style={styles.fieldHeader}>
                    <View style={styles.fieldTitleRow}>
                      <Ionicons name="key-outline" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                        Contraseña
                      </Text>
                    </View>

                    <View style={styles.rightButtonsRow}>
                      <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        style={({ pressed }) => [
                          styles.eyeButton,
                          { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={theme.textSecondary}
                        />
                      </Pressable>

                      <Pressable
                        onPress={handleCopyPassword}
                        style={({ pressed }) => [
                          styles.copyPill,
                          {
                            backgroundColor: copiedPass ? theme.successLight : theme.card,
                            borderColor: copiedPass ? theme.success : theme.border,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Ionicons
                          name={copiedPass ? 'checkmark-circle' : 'copy-outline'}
                          size={18}
                          color={copiedPass ? theme.success : theme.primary}
                          style={[{ marginRight: 4 }, { marginLeft: 10 }]}
                        />
                      </Pressable>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.fieldValue,
                      { color: theme.text, fontFamily: showPassword ? 'monospace' : undefined },
                    ]}
                    selectable
                  >
                    {showPassword ? item.password : '••••••••••••••••'}
                  </Text>

                  {/* Nivel de seguridad de la clave */}
                  <View style={styles.strengthRow}>
                    <View style={[styles.dot, { backgroundColor: evaluation.color }]} />
                    <Text style={[styles.strengthText, { color: evaluation.color }]}>
                      Fuerza: {evaluation.label}
                    </Text>
                    <Text style={[styles.crackTimeText, { color: theme.textMuted }]}>
                      • {evaluation.crackTimeDisplay}
                    </Text>
                  </View>
                </View>

                {/* Fechas de auditoría */}
                <View style={[styles.datesCard, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}>
                  <View style={styles.dateItem}>
                    <Text style={[styles.dateLabel, { color: theme.textMuted }]}>Creada</Text>
                    <Text style={[styles.dateValue, { color: theme.text }]}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={[styles.dateDivider, { backgroundColor: theme.border }]} />

                  <View style={styles.dateItem}>
                    <Text style={[styles.dateLabel, { color: theme.textMuted }]}>Actualizada</Text>
                    <Text style={[styles.dateValue, { color: theme.text }]}>
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                  </View>

                  {item.recommendedChangeDate && (
                    <>
                      <View style={[styles.dateDivider, { backgroundColor: theme.border }]} />
                      <View style={styles.dateItem}>
                        <Text style={[styles.dateLabel, { color: theme.textMuted }]}>Renovación</Text>
                        <Text
                          style={[
                            styles.dateValue,
                            {
                              color: isExpired
                                ? theme.danger
                                : isNearExpiry
                                  ? theme.warning
                                  : theme.success,
                              fontWeight: isExpired ? '700' : '500',
                            },
                          ]}
                        >
                          {isExpired
                            ? '¡Expiró!'
                            : new Date(item.recommendedChangeDate).toLocaleDateString()}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Notas si existen */}
                {!!item.notes && (
                  <View style={[styles.fieldCard, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}>
                    <View style={styles.fieldTitleRow}>
                      <Ionicons name="document-text-outline" size={16} color={theme.primary} style={{ marginRight: 6 }} />
                      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Notas</Text>
                    </View>
                    <Text style={[styles.notesText, { color: theme.text }]}>{item.notes}</Text>
                  </View>
                )}
              </ScrollView>

              {/* Botones de acción inferiores */}
              <View style={styles.actionButtonsContainer}>

                <CustomButton
                  title='Editar clave'
                  icon='pencil-outline'
                  onPress={() => onEdit(item)}
                  variant='primary'
                  containerStyle={{ flex: 1 }}
                />

                <CustomButton
                  title='Eliminar'
                  icon='trash-outline'
                  onPress={() => setIsConfirmingDelete(true)}
                  variant='danger'
                  containerStyle={{ flex: 1 }}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 20,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  serviceHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  titleWrapper: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollArea: {
    maxHeight: 380,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  fieldCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  rightButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyeButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  copyPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  crackTimeText: {
    fontSize: 12,
    marginLeft: 6,
  },
  datesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  dateItem: {
    alignItems: 'center',
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateDivider: {
    width: 1,
    height: 24,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
  },
  actionDeleteBtn: {
    flex: 1,
    borderWidth: 1,
  },
  actionEditBtn: {
    flex: 1.5,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmDeleteContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  warningIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

