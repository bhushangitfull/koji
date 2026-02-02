/**
 * AuthInput Component
 * Reusable input field for authentication forms
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AuthInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  isPassword?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  labelColor?: string;
  placeholderColor?: string;
  iconColor?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  icon,
  isPassword = false,
  value,
  onChangeText,
  placeholder,
  labelColor,
  placeholderColor,
  iconColor,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const finalLabelColor = labelColor || colors.text;
  const finalPlaceholderColor = placeholderColor || colors.textSecondary;
  const finalIconColor = iconColor || colors.primary;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: finalLabelColor }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? '#FF6B6B' : colors.primary,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={20}
            color={error ? '#FF6B6B' : finalIconColor}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={finalPlaceholderColor}
          secureTextEntry={isPassword && !isPasswordVisible}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeButton}
          >
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color={finalIconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'VT323',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 14,
    height: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontFamily: 'VT323',
  },
  eyeButton: {
    padding: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
    fontFamily: 'VT323',
  },
});
