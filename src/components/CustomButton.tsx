import React, { useRef } from 'react';
import {
  Text,
  Animated,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/useThemeStore';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  containerStyle,
  textStyle,
  size = 'md',
}) => {
  const { theme, isDark } = useThemeStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animación de presión suave y fluida
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  // Determinación de colores según variante y tema (Azul en claro / Morado en oscuro)
  let backgroundColor: string;
  let textColor: string;
  let borderColor: string = 'transparent';

  switch (variant) {
    case 'primary':
      backgroundColor = theme.primary;
      textColor = '#FFFFFF';
      break;
    case 'secondary':
      backgroundColor = isDark ? theme.cardSecondary : theme.cardSecondary;
      textColor = theme.text;
      break;
    case 'danger':
      backgroundColor = theme.danger;
      textColor = '#FFFFFF';
      break;
    case 'outline':
      backgroundColor = 'transparent';
      borderColor = theme.primary;
      textColor = theme.primary;
      break;
    case 'ghost':
      backgroundColor = 'transparent';
      textColor = theme.textSecondary;
      break;
  }

  // Tamaños
  const height = size === 'sm' ? 38 : size === 'lg' ? 52 : 46;
  const paddingHorizontal = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        style?.flex !== undefined && { flex: style.flex },
        disabled && styles.disabled,
        containerStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor,
            borderColor,
            borderWidth: variant === 'outline' ? 1.5 : 0,
            height,
            paddingHorizontal,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' && (
              <Ionicons
                name={icon}
                size={iconSize}
                color={textColor}
                style={styles.leftIcon}
              />
            )}
            <Text
              style={[
                styles.text,
                { color: textColor, fontSize, fontWeight: '600' },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons
                name={icon}
                size={iconSize}
                color={textColor}
                style={styles.rightIcon}
              />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  text: {
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
