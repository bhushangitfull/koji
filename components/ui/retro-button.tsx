import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RetroButtonProps {
  onPress: () => void;
  children: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function RetroButton({
  onPress,
  children,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}: RetroButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderColor: '#000000',
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderColor: '#000000',
    },
    outline: {
      backgroundColor: colors.retroLavender,
      borderColor: '#000000',
    },
  };

  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 12,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 14,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 28,
      fontSize: 16,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        currentVariant,
        {
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: currentSize.fontSize,
            color: variant === 'outline' ? '#000000' : '#000000',
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#000000',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Fonts.sans,
  },
});
