/**
 * Forgot Password Screen
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
import { validateEmail, parseAuthError } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ForgotPasswordStep = 'email' | 'reset' | 'success';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestReset = useCallback(async () => {
    try {
      const validation = validateEmail(email);
      if (!validation.valid) {
        setError(validation.error || 'Invalid email');
        return;
      }

      setError(null);
      setLoading(true);

      await forgotPassword({ email });

      // Show success message
      setStep('reset');
      Alert.alert(
        'Check Your Email',
        'We sent a password reset link to your email. Please check your inbox and follow the instructions.'
      );
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  }, [email, forgotPassword]);

  const handleResetPassword = useCallback(async () => {
    try {
      if (!resetToken.trim()) {
        setError('Please enter the reset code from your email');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      setError(null);
      setLoading(true);

      await resetPassword({
        token: resetToken,
        newPassword,
      });

      setStep('success');
      Alert.alert('Success', 'Your password has been reset. You can now sign in with your new password.');

      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.replace('/(auth)/sign-in');
      }, 2000);
    } catch (err: any) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  }, [resetToken, newPassword, confirmPassword, resetPassword, router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons
              name="lock-reset"
              size={60}
              color={colors.primary}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {step === 'email' && 'Enter your email to reset your password'}
              {step === 'reset' && 'Enter the code and your new password'}
              {step === 'success' && 'Password reset successfully!'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {step === 'email' && (
              <>
                <AuthInput
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  icon="email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />

                <View style={styles.infoBox}>
                  <MaterialCommunityIcons
                    name="information"
                    size={18}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    We'll send a password reset link to this email
                  </Text>
                </View>
              </>
            )}

            {step === 'reset' && (
              <>
                <AuthInput
                  label="Reset Code"
                  placeholder="Enter code from email"
                  value={resetToken}
                  onChangeText={setResetToken}
                  icon="key"
                  editable={!loading}
                />

                <AuthInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon="lock"
                  isPassword
                  editable={!loading}
                />

                <AuthInput
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="lock-check"
                  isPassword
                  editable={!loading}
                />
              </>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={80}
                  color={colors.success}
                  style={{ marginBottom: 16 }}
                />
                <Text style={[styles.successText, { color: colors.text }]}>
                  Password Reset Successfully!
                </Text>
                <Text style={[styles.successSubtext, { color: colors.textSecondary }]}>
                  Redirecting to sign in...
                </Text>
              </View>
            )}

            {error && (
              <View style={[styles.errorBox, { backgroundColor: '#FFE5E5' }]}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={18}
                  color="#FF6B6B"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.errorText, { color: '#FF6B6B' }]}>
                  {error}
                </Text>
              </View>
            )}

            {step !== 'success' && (
              <AuthButton
                label={step === 'email' ? 'Send Reset Link' : 'Reset Password'}
                onPress={step === 'email' ? handleRequestReset : handleResetPassword}
                loading={loading}
                disabled={loading}
              />
            )}
          </View>

          {/* Back to Sign In */}
          {step !== 'success' && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.textSecondary + '30' }]} />
              <TouchableOpacity
                onPress={() => {
                  if (step === 'reset') {
                    setStep('email');
                    setEmail('');
                    setResetToken('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError(null);
                  } else {
                    router.back();
                  }
                }}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.backLink,
                    { color: colors.primary, opacity: loading ? 0.5 : 1 },
                  ]}
                >
                  ← Back to {step === 'reset' ? 'Email' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
