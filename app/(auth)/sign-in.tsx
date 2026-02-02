/**
 * Sign In Screen
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { AuthInput } from '@/components/AuthInput';
import { AuthButton } from '@/components/AuthButton';
import { validateSignIn, parseAuthError } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SignInScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signIn } = useAuth();

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
          {/* Header with background card */}
          <View style={[styles.headerCard, { backgroundColor: colors.retroLavender + '40' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons
                name="account-circle"
                size={50}
                color="#fff"
              />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>
              Welcome Back!
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, shadowColor: colors.primary }]}>
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
                  { color: colors.primary, opacity: loading ? 0.5 : 1 },
                ]}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <AuthButton
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
            />
          </View>

          {/* Or Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.textSecondary + '30' }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              or
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.textSecondary + '30' }]} />
          </View>

          {/* Sign Up Link Card */}
          <View style={[styles.signUpCard, { backgroundColor: colors.retroMint + '30', borderColor: colors.primary }]}>
            <Text style={[styles.signUpText, { color: colors.text }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/sign-up')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.signUpLink,
                  { color: colors.primary, opacity: loading ? 0.5 : 1 },
                ]}
              >
                Create One Now →
              </Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#9B59B6' + '20',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forgotPasswordButton: {
    marginBottom: 20,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  signUpCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
