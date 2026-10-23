import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PasswordEvaluationResult } from '../types';
import { useThemeStore } from '../store/useThemeStore';

interface StrengthIndicatorProps {
  evaluation: PasswordEvaluationResult;
  showDetails?: boolean;
}

export const StrengthIndicator: React.FC<StrengthIndicatorProps> = ({
  evaluation,
  showDetails = true,
}) => {
  const { theme } = useThemeStore();
  const widthAnim = useRef(new Animated.Value(0)).current;

  // Calculamos porcentaje basado en score (0 a 4)
  const targetPercent = Math.max(10, ((evaluation.score + 1) / 5) * 100);

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: targetPercent,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [targetPercent]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Barra de progreso */}
      <View style={[styles.barBackground, { backgroundColor: theme.cardSecondary }]}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: animatedWidth,
              backgroundColor: evaluation.color,
            },
          ]}
        />
      </View>

      {/* Etiquetas superiores de estado */}
      <View style={styles.headerRow}>
        <View style={styles.badgeContainer}>
          <View style={[styles.dot, { backgroundColor: evaluation.color }]} />
          <Text style={[styles.scoreLabel, { color: evaluation.color }]}>
            {evaluation.label}
          </Text>
        </View>

        <Text style={[styles.crackTimeText, { color: theme.textMuted }]}>
          Tiempo de descifrado: <Text style={{ color: theme.text, fontWeight: '600' }}>{evaluation.crackTimeDisplay}</Text>
        </Text>
      </View>

      {/* Detalles adicionales opcionales (advertencias y sugerencias) */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          {evaluation.warning && (
            <View style={[styles.alertBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
              <Ionicons name="warning-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
              <Text style={styles.alertText}>{evaluation.warning}</Text>
            </View>
          )}

          {evaluation.suggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              {evaluation.suggestions.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color={theme.primary}
                    style={{ marginRight: 6, marginTop: 2 }}
                  />
                  <Text style={[styles.suggestionText, { color: theme.textSecondary }]}>
                    {suggestion}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  barBackground: {
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  crackTimeText: {
    fontSize: 12,
  },
  detailsContainer: {
    marginTop: 10,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  alertText: {
    fontSize: 12,
    color: '#991B1B',
    flex: 1,
    fontWeight: '500',
  },
  suggestionsList: {
    marginTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
});
