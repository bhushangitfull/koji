/**
 * Forgot Password Screen - Comforting Retro Design
 */

import { AuthButton } from '@/components/AuthButton';
import { AuthInput } from '@/components/AuthInput';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { parseAuthError, validateEmail } from '@/utils/validation';
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

type ForgotPasswordStep = 'email' | 'reset' | 'success';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { forgotPassword, resetPassword } = useAuth();

  // Load VT323 font
  const [fontsLoaded] = useFonts({
    'VT323': require('@/assets/fonts/VT323-Regular.ttf'),
  });

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
          {/* Decorative Top */}
          <View style={styles.decorativeTop}>
            <View style={[styles.decorativeDot, { backgroundColor: colors.retroLavender }]} />
            <View style={[styles.decorativeDot, { backgroundColor: colors.retroPeach }]} />
            <View style={[styles.decorativeDot, { backgroundColor: colors.retroMint }]} />
          </View>

          {/* Header */}
          <View style={[styles.headerCard, { backgroundColor: 'rgba(255, 255, 255, 0.6)' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons
                name={step === 'success' ? 'check-circle' : 'lock-reset'}
                size={44}
                color="#fff"
              />
            </View>
            <Text style={[styles.title, { color: colors.primary, fontFamily: 'VT323' }]}>
              {step === 'success' ? 'All Set!' : 'Password Reset'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text, fontFamily: 'VT323' }]}>
              {step === 'email' && 'No worries, we\'ll help you get back in'}
              {step === 'reset' && 'Create a new password you\'ll remember'}
              {step === 'success' && 'You\'re ready to continue learning!'}
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: 'rgba(255, 255, 255, 0.85)' }]}>
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

                <View style={[styles.infoBox, { backgroundColor: colors.retroMint + '40' }]}>
                  <MaterialCommunityIcons
                    name="information"
                    size={20}
                    color={colors.primary}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={[styles.infoText, { color: colors.text, fontFamily: 'VT323' }]}>
                    We'll send a reset link to your email
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
                  placeholder="Choose a new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  icon="lock"
                  isPassword
                  editable={!loading}
                />

                <AuthInput
                  label="Confirm Password"
                  placeholder="Type it again to be sure"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  icon="lock-check"
                  isPassword
                  editable={!loading}
                />

                <View style={[styles.infoBox, { backgroundColor: colors.retroPeach + '40' }]}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={20}
                    color={colors.primary}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={[styles.infoText, { color: colors.text, fontFamily: 'VT323' }]}>
                    Make it strong and memorable!
                  </Text>
                </View>
              </>
            )}

            {step === 'success' && (
              <View style={styles.successContainer}>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={80}
                  color={colors.primary}
                  style={{ marginBottom: 20 }}
                />
                <Text style={[styles.successText, { color: colors.text, fontFamily: 'VT323' }]}>
                  Password Reset Complete!
                </Text>
                <Text style={[styles.successSubtext, { color: colors.textSecondary, fontFamily: 'VT323' }]}>
                  Taking you to sign in...
                </Text>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                </View>
              </View>
            )}

            {error && (
              <View style={[styles.errorBox, { backgroundColor: '#FFE5E5' }]}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={20}
                  color="#FF6B6B"
                  style={{ marginRight: 10 }}
                />
                <Text style={[styles.errorText, { color: '#FF6B6B', fontFamily: 'VT323' }]}>
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

          {/* Back Link */}
          {step !== 'success' && (
            <>
              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: colors.primary + '30' }]} />
              </View>
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
                style={styles.backButton}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 8, opacity: loading ? 0.5 : 1 }}
                />
                <Text
                  style={[
                    styles.backLink,
                    { color: colors.primary, opacity: loading ? 0.5 : 1, fontFamily: 'VT323' },
                  ]}
                >
                  Back to {step === 'reset' ? 'Email' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Decorative Bottom */}
          <View style={styles.decorativeBottom}>
            <View style={[styles.decorativeSquare, { backgroundColor: colors.retroPeach }]} />
            <View style={[styles.decorativeSquare, { backgroundColor: colors.retroLavender }]} />
            <View style={[styles.decorativeSquare, { backgroundColor: colors.retroMint }]} />
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
  decorativeTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  decorativeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#9B59B6',
    borderTopColor: '#E1BEE7',
    borderLeftColor: '#E1BEE7',
    borderBottomColor: '#5A2D7A',
    borderRightColor: '#5A2D7A',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#9B59B6',
    borderTopColor: '#E1BEE7',
    borderLeftColor: '#E1BEE7',
    borderBottomColor: '#5A2D7A',
    borderRightColor: '#5A2D7A',
  },
  title: {
    fontSize: 42,
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'VT323',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'VT323',
  },
  formCard: {
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#9B59B6',
    borderTopColor: '#E1BEE7',
    borderLeftColor: '#E1BEE7',
    borderBottomColor: '#5A2D7A',
    borderRightColor: '#5A2D7A',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#7FE5DE',
    borderTopColor: '#B2F5F1',
    borderLeftColor: '#B2F5F1',
    borderBottomColor: '#2BB8AE',
    borderRightColor: '#2BB8AE',
  },
  infoText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'VT323',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderTopColor: '#FFB3B3',
    borderLeftColor: '#FFB3B3',
    borderBottomColor: '#CC0000',
    borderRightColor: '#CC0000',
  },
  errorText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'VT323',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    borderWidth: 2,
    borderColor: '#A8E6CF',
    borderTopColor: '#D4F5E9',
    borderLeftColor: '#D4F5E9',
    borderBottomColor: '#5CBFA8',
    borderRightColor: '#5CBFA8',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  successText: {
    fontSize: 28,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'VT323',
  },
  successSubtext: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'VT323',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dividerContainer: {
    marginVertical: 24,
    paddingHorizontal: 20,
  },
  dividerLine: {
    height: 2,
    borderRadius: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  backLink: {
    fontSize: 20,
    fontWeight: '400',
  },
  decorativeBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  decorativeSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});