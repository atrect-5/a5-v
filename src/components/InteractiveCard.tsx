import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
  StyleSheet,
  View,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface InteractiveCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onPress,
  style,
  interactive = false,
}) => {
  const { theme, isDark } = useThemeStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!interactive && !onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (!interactive && !onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 4,
    }).start();
  };

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: isDark ? '#000000' : '#64748B',
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress || interactive) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {cardContent}
        </Pressable>
      </Animated.View>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
