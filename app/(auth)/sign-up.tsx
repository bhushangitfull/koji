/**
 * Sign Up Screen - Retro Design with Offset Shadows
 */

import { AuthButton } from '@/components/AuthButton';
import { AuthInput } from '@/components/AuthInput';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { parseAuthError, validateSignUp } from '@/utils/validation';
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

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signUp } = useAuth();

  // Load VT323 font
  const [fontsLoaded] = useFonts({
    'VT323': require('@/assets/fonts/VT323-Regular.ttf'),
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignUp = useCallback(async () => {
    try {
      // Validate form
      const validation = validateSignUp(email, password, confirmPassword, name);
      if (!validation.valid) {
        setErrors(validation.errors);
        return;
      }

      setErrors({});
      setLoading(true);

      // Sign up
      await signUp({
        name,
        email,
        password,
        jlptLevel: 'N5',
      });

      // Navigate to home
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMessage = parseAuthError(error);
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirmPassword, signUp, router]);

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
              <View style={[styles.lineSegment, { backgroundColor: colors.retroMint }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.retroPeach }]} />
            </View>
          </View>

          {/* Main Header Box with Shadow */}
          <View style={styles.headerShadowContainer}>
            <View style={[styles.headerShadow, { backgroundColor: colors.primary }]} />
            <View style={[styles.headerBox, { 
              backgroundColor: colors.retroPeach,
              borderColor: colors.retroBorder,
            }]}>
              <View style={[styles.iconBox, { 
                backgroundColor: colors.primary,
                borderColor: colors.retroBorder,
              }]}>
                <MaterialCommunityIcons
                  name="star"
                  size={40}
                  color={colors.retroBg}
                />
              </View>
              <Text style={[styles.title, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                START YOUR JOURNEY
              </Text>
              <Text style={[styles.subtitle, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                learn japanese together, step by step
              </Text>
            </View>
          </View>

          {/* Form Box with Shadow */}
          <View style={styles.formShadowContainer}>
            <View style={[styles.formShadow, { backgroundColor: colors.primary }]} />
            <View style={[styles.formBox, { 
              backgroundColor: colors.retroLavender,
              borderColor: colors.retroBorder,
            }]}>
              <AuthInput
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                icon="account"
                autoCapitalize="words"
                error={errors.name}
                editable={!loading}
              />

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
                placeholder="Choose a strong password"
                value={password}
                onChangeText={setPassword}
                icon="lock"
                isPassword
                error={errors.password}
                editable={!loading}
              />

              <AuthInput
                label="Confirm Password"
                placeholder="Type it again to be sure"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="lock-check"
                isPassword
                error={errors.confirmPassword}
                editable={!loading}
              />

              {/* Password Tips Box */}
              <View style={[styles.tipsBox, { 
                backgroundColor: colors.accent,
                borderColor: colors.retroBorder,
              }]}>
                <Text style={[styles.tipsTitle, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                  ▸ PASSWORD TIPS
                </Text>
                <RequirementItem text="8+ characters" />
                <RequirementItem text="uppercase & lowercase" />
                <RequirementItem text="include a number" />
              </View>

              {/* Encouraging Message */}
              <View style={[styles.encouragementBox, { 
                backgroundColor: colors.retroMint,
                borderColor: colors.retroBorder,
              }]}>
                <Text style={[styles.encouragementText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                  ★ something amazing starts today ★
                </Text>
              </View>

              {/* Sign Up Button */}
              <AuthButton
                label="CREATE ACCOUNT"
                onPress={handleSignUp}
                loading={loading}
                disabled={loading}
              />
            </View>
          </View>

          {/* Pixel Divider */}
          <View style={styles.pixelDivider}>
            <View style={[styles.pixel, { backgroundColor: colors.primary }]} />
            <View style={[styles.pixel, { backgroundColor: colors.retroMint }]} />
            <View style={[styles.pixel, { backgroundColor: colors.retroPeach }]} />
            <View style={[styles.pixel, { backgroundColor: colors.retroLavender }]} />
            <View style={[styles.pixel, { backgroundColor: colors.primary }]} />
          </View>

          {/* Sign In Box with Shadow */}
          <View style={styles.signInShadowContainer}>
            <View style={[styles.signInShadow, { backgroundColor: colors.primary }]} />
            <View style={[styles.signInBox, { 
              backgroundColor: colors.retroMint,
              borderColor: colors.retroBorder,
            }]}>
              <MaterialCommunityIcons
                name="account-arrow-right"
                size={36}
                color={colors.retroBorder}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.signInText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                already part of our family?
              </Text>
              <TouchableOpacity
                onPress={() => router.replace('/(auth)/sign-in')}
                disabled={loading}
                style={[styles.signInButtonBox, {
                  backgroundColor: colors.primary,
                  borderColor: colors.retroBorder,
                }]}
              >
                <Text
                  style={[
                    styles.signInLink,
                    { color: '#FFFFFF', opacity: loading ? 0.5 : 1, fontFamily: 'VT323' },
                  ]}
                >
                  SIGN IN HERE
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Decorative Footer */}
          <View style={styles.decorativeFooter}>
            <View style={styles.decorativeLine}>
              <View style={[styles.lineSegment, { backgroundColor: colors.retroPeach }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.retroMint }]} />
              <View style={[styles.lineSegment, { backgroundColor: colors.primary }]} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const RequirementItem: React.FC<{ text: string }> = ({ text }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.requirementItem}>
      <Text style={[styles.bullet, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
        •
      </Text>
      <Text style={[styles.requirementText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
        {text}
      </Text>
    </View>
  );
};

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
    fontSize: 38,
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
  tipsBox: {
    borderWidth: 3,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '400',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 20,
    marginRight: 8,
  },
  requirementText: {
    fontSize: 18,
    fontWeight: '400',
  },
  encouragementBox: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 3,
  },
  encouragementText: {
    fontSize: 18,
    fontWeight: '400',
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
  // Sign in box with shadow
  signInShadowContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  signInShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderWidth: 3,
    borderColor: '#000',
  },
  signInBox: {
    borderWidth: 3,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  signInText: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: '400',
  },
  signInButtonBox: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 3,
  },
  signInLink: {
    fontSize: 22,
    fontWeight: '400',
    letterSpacing: 1,
  },
  decorativeFooter: {
    marginTop: 20,
  },
});