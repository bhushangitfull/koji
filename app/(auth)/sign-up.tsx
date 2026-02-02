/**
 * Sign Up Screen
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
import { validateSignUp, parseAuthError } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signUp } = useAuth();

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
          <View style={[styles.headerCard, { backgroundColor: colors.retroPeach + '40' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons
                name="account-plus"
                size={50}
                color="#fff"
              />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>
              Create Account
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Start your Japanese learning journey
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, shadowColor: colors.primary }]}>
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
              placeholder="Min 8 chars, uppercase, number"
              value={password}
              onChangeText={setPassword}
              icon="lock"
              isPassword
              error={errors.password}
              editable={!loading}
            />

            <AuthInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              icon="lock-check"
              isPassword
              error={errors.confirmPassword}
              editable={!loading}
            />

            {/* Password Requirements */}
            <View style={[styles.requirementsContainer, { backgroundColor: colors.retroIndigo + '15' }]}>
              <Text style={[styles.requirementsLabel, { color: colors.primary }]}>
                Password Requirements:
              </Text>
              <RequirementItem text="At least 8 characters" />
              <RequirementItem text="1 uppercase letter (A-Z)" />
              <RequirementItem text="1 lowercase letter (a-z)" />
              <RequirementItem text="1 number (0-9)" />
            </View>

            {/* Sign Up Button */}
            <AuthButton
              label="Create Account"
              onPress={handleSignUp}
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

          {/* Sign In Link Card */}
          <View style={[styles.signInCard, { backgroundColor: colors.retroMint + '30', borderColor: colors.primary }]}>
            <Text style={[styles.signInText, { color: colors.text }]}>
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/sign-in')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.signInLink,
                  { color: colors.primary, opacity: loading ? 0.5 : 1 },
                ]}
              >
                Sign In Instead →
              </Text>
            </TouchableOpacity>
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
      <MaterialCommunityIcons
        name="check-circle"
        size={16}
        color={colors.primary}
        style={{ marginRight: 8 }}
      />
      <Text style={[styles.requirementText, { color: colors.text }]}>
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
  requirementsContainer: {
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9B59B6',
  },
  requirementsLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
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
  signInCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '700',
  },
});
