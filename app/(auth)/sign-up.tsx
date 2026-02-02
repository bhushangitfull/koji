/**
 * Forgot Password Screen - Retro Design with Offset Shadows
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

  const getHeaderColor = () => {
    if (step === 'email') return colors.retroPeach;
    if (step === 'reset') return colors.retroLavender;
    return colors.retroMint;
  };

  const getFormColor = () => {
    if (step === 'email') return colors.retroLavender;
    if (step === 'reset') return colors.retroPeach;
    return colors.accent;
  };

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
              <View style={[styles.lineSegment, { backgroundColor: colors.retroLavender }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.retroPeach }]} />
            </View>
          </View>

          {/* Main Header Box with Shadow */}
          <View style={styles.headerShadowContainer}>
            <View style={[styles.headerShadow, { backgroundColor: colors.primary }]} />
            <View style={[styles.headerBox, { 
              backgroundColor: getHeaderColor(),
              borderColor: colors.retroBorder,
            }]}>
              <View style={[styles.iconBox, { 
                backgroundColor: colors.primary,
                borderColor: colors.retroBorder,
              }]}>
                <MaterialCommunityIcons
                  name={step === 'success' ? 'check' : 'lock-reset'}
                  size={40}
                  color={colors.retroBg}
                />
              </View>
              <Text style={[styles.title, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                {step === 'success' ? 'ALL SET!' : 'PASSWORD RESET'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                {step === 'email' && 'no worries, we\'ll help you'}
                {step === 'reset' && 'create a new password'}
                {step === 'success' && 'ready to continue learning!'}
              </Text>
            </View>
          </View>

          {/* Form Box with Shadow */}
          <View style={styles.formShadowContainer}>
            <View style={[styles.formShadow, { backgroundColor: colors.primary }]} />
            <View style={[styles.formBox, { 
              backgroundColor: getFormColor(),
              borderColor: colors.retroBorder,
            }]}>
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

                  <View style={[styles.infoBox, { 
                    backgroundColor: colors.retroMint,
                    borderColor: colors.retroBorder,
                  }]}>
                    <Text style={[styles.infoText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                      ▸ we'll send a reset link to your email
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

                  <View style={[styles.infoBox, { 
                    backgroundColor: colors.retroMint,
                    borderColor: colors.retroBorder,
                  }]}>
                    <Text style={[styles.infoText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                      ▸ make it strong and memorable!
                    </Text>
                  </View>
                </>
              )}

              {step === 'success' && (
                <View style={styles.successContainer}>
                  <View style={[styles.successBox, {
                    backgroundColor: colors.primary,
                    borderColor: colors.retroBorder,
                  }]}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={64}
                      color="#FFFFFF"
                      style={{ marginBottom: 16 }}
                    />
                    <Text style={[styles.successText, { color: '#FFFFFF', fontFamily: 'VT323' }]}>
                      PASSWORD RESET COMPLETE!
                    </Text>
                  </View>
                  <Text style={[styles.successSubtext, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                    taking you to sign in...
                  </Text>
                  <View style={styles.loadingDots}>
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                    <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  </View>
                </View>
              )}

              {error && (
                <View style={[styles.errorBox, { 
                  backgroundColor: '#FFE5E5',
                  borderColor: '#FF6B6B',
                }]}>
                  <Text style={[styles.errorText, { color: '#FF6B6B', fontFamily: 'VT323' }]}>
                    ✕ {error}
                  </Text>
                </View>
              )}

              {step !== 'success' && (
                <AuthButton
                  label={step === 'email' ? 'SEND RESET LINK' : 'RESET PASSWORD'}
                  onPress={step === 'email' ? handleRequestReset : handleResetPassword}
                  loading={loading}
                  disabled={loading}
                />
              )}
            </View>
          </View>

          {/* Back Link */}
          {step !== 'success' && (
            <>
              <View style={styles.pixelDivider}>
                <View style={[styles.pixel, { backgroundColor: colors.primary }]} />
                <View style={[styles.pixel, { backgroundColor: colors.retroPeach }]} />
                <View style={[styles.pixel, { backgroundColor: colors.primary }]} />
              </View>
              
              <View style={styles.backShadowContainer}>
                <View style={[styles.backShadow, { backgroundColor: colors.primary }]} />
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
                  style={[styles.backButtonBox, {
                    backgroundColor: colors.retroMint,
                    borderColor: colors.retroBorder,
                  }]}
                >
                  <Text
                    style={[
                      styles.backLink,
                      { color: colors.retroBorder, opacity: loading ? 0.5 : 1, fontFamily: 'VT323' },
                    ]}
                  >
                    ← BACK TO {step === 'reset' ? 'EMAIL' : 'SIGN IN'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

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
  // Header with shadow
  headerShadowContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  headerShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderWidth: 3,
    borderColor: '#000',
  },
  headerBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 3,
    position: 'relative',
    zIndex: 1,
  },
  iconBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
  },
  title: {
    fontSize: 40,
    fontWeight: '400',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 26,
  },
  // Form with shadow
  formShadowContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  formShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderWidth: 3,
    borderColor: '#000',
  },
  formBox: {
    borderWidth: 3,
    padding: 24,
    position: 'relative',
    zIndex: 1,
  },
  infoBox: {
    padding: 16,
    marginBottom: 20,
    borderWidth: 3,
  },
  infoText: {
    fontSize: 18,
    lineHeight: 24,
  },
  errorBox: {
    padding: 16,
    marginBottom: 20,
    borderWidth: 3,
  },
  errorText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successBox: {
    padding: 24,
    borderWidth: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: '400',
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
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
  // Back button with shadow
  backShadowContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  backShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
    borderColor: '#000',
  },
  backButtonBox: {
    padding: 16,
    borderWidth: 3,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  backLink: {
    fontSize: 20,
    fontWeight: '400',
  },
  decorativeFooter: {
    marginTop: 20,
  },
});