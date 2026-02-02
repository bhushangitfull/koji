/**
 * Sign In Screen - Retro Comforting Design
 */

import { AuthButton } from '@/components/AuthButton';
import { AuthInput } from '@/components/AuthInput';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { parseAuthError, validateSignIn } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn } = useAuth();

  // Load VT323 font
  const [fontsLoaded] = useFonts({
    'VT323': require('@/assets/fonts/VT323-Regular.ttf'),
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignIn = useCallback(async () => {
    try {
      // Validate form
      const validation = validateSignIn(email, password);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      setLoading(true);

      // Sign in
      await signIn({ email, password });

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage = parseAuthError(error);
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Retro Decorative Header */}
          <View style={styles.decorativeHeader}>
            <View style={styles.decorativeLine}>
              <View style={[styles.lineSegment, { backgroundColor: colors.primary }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.retroPeach }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.retroMint }]} />
            </View>
          </View>

          {/* Main Header Box */}
          <View style={[styles.headerBox, { 
            backgroundColor: colors.retroLavender,
            borderColor: colors.retroBorder,
          }]}>
            <View style={[styles.iconBox, { 
              backgroundColor: colors.primary,
              borderColor: colors.retroBorder,
            }]}>
              <MaterialCommunityIcons
                name="heart"
                size={40}
                color={colors.retroBg}
              />
            </View>
            <Text style={[styles.title, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
              WELCOME
            </Text>
            <Text style={[styles.subtitle, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
              continue your japanese journey
            </Text>
          </View>

          {/* Form Box */}
          <View style={[styles.formBox, { 
            backgroundColor: colors.retroPeach,
            borderColor: colors.retroBorder,
          }]}>
            <AuthInput
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              icon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              editable={!loading}
              labelColor="#000"
              placeholderColor="#fff"
            />

            <AuthInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              icon="lock"
              isPassword
              error={errors.password}
              editable={!loading}
              labelColor="#000"
              placeholderColor="#fff"
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              disabled={loading}
              style={styles.forgotPasswordButton}
            >
              <Text
                style={[
                  styles.forgotPassword,
                  { color: colors.primary, opacity: loading ? 0.5 : 1, fontFamily: 'VT323' },
                ]}
              >
                forgot password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <AuthButton
              label="SIGN IN"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
            />
          </View>

          {/* Pixel Divider */}
          <View style={styles.pixelDivider}>
            <View style={[styles.pixel, { backgroundColor: colors.primary }]} />
            <View style={[styles.pixel, { backgroundColor: colors.retroPeach }]} />
            <View style={[styles.pixel, { backgroundColor: colors.retroMint }]} />
            <View style={[styles.pixel, { backgroundColor: colors.retroLavender }]} />
            <View style={[styles.pixel, { backgroundColor: colors.primary }]} />
          </View>

          {/* Sign Up Box */}
          <View style={[styles.signUpBox, { 
            backgroundColor: colors.retroMint,
            borderColor: colors.retroBorder,
          }]}>
            <MaterialCommunityIcons
              name="account-plus"
              size={36}
              color={colors.retroBorder}
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.signUpText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
              new to our community?
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/sign-up')}
              disabled={loading}
              style={[styles.signUpButtonBox, {
                backgroundColor: colors.primary,
                borderColor: colors.retroBorder,
              }]}
            >
              <Text
                style={[
                  styles.signUpLink,
                  { color: '#FFFFFF', opacity: loading ? 0.5 : 1, fontFamily: 'VT323' },
                ]}
              >
                JOIN US TODAY
              </Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Footer */}
          <View style={styles.decorativeFooter}>
            <View style={styles.decorativeLine}>
              <View style={[styles.lineSegment, { backgroundColor: colors.retroMint }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.retroPeach }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.primary }]} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  decorativeHeader: {
    marginBottom: 20,
  },
  decorativeLine: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  lineSegment: {
    width: 60,
    height: 4,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: '#9B59B6',
    borderTopColor: '#E1BEE7',
    borderLeftColor: '#E1BEE7',
    borderBottomColor: '#5A2D7A',
    borderRightColor: '#5A2D7A',
  },
  iconBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#9B59B6',
    borderTopColor: '#E1BEE7',
    borderLeftColor: '#E1BEE7',
    borderBottomColor: '#5A2D7A',
    borderRightColor: '#5A2D7A',
  },
  title: {
    fontSize: 40,
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'VT323',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'VT323',
  },
  formBox: {
    borderWidth: 3,
    borderColor: '#9B59B6',
    borderTopColor: '#E1BEE7',
    borderLeftColor: '#E1BEE7',
    borderBottomColor: '#5A2D7A',
    borderRightColor: '#5A2D7A',
    padding: 24,
    marginBottom: 24,
  },
  forgotPasswordButton: {
    marginBottom: 20,
    marginTop: 4,
  },
  forgotPassword: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'right',
    fontFamily: 'VT323',
  },
  encouragementBox: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 3,
    borderColor: '#FFB3D9',
    borderTopColor: '#FFE0F0',
    borderLeftColor: '#FFE0F0',
    borderBottomColor: '#FF66B2',
    borderRightColor: '#FF66B2',
  },
  encouragementText: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'VT323',
  },
  pixelDivider: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 24,
  },
  pixel: {
    width: 12,
    height: 12,
  },
  signUpBox: {
    borderWidth: 3,
    borderColor: '#7FE5DE',
    borderTopColor: '#B2F5F1',
    borderLeftColor: '#B2F5F1',
    borderBottomColor: '#2BB8AE',
    borderRightColor: '#2BB8AE',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '400',
    fontFamily: 'VT323',
  },
  signUpButtonBox: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 3,
  },
  signUpLink: {
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 1,
    fontFamily: 'VT323',
  },
  decorativeFooter: {
    marginTop: 20,
  },
});