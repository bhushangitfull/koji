/**
 * User Setup Screen - Simplified
 * Collects user display name and JLPT level after signup
 */

import { AuthInput } from '@/components/AuthInput';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserProfile } from '@/hooks/useUserProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

const JLPT_LEVELS: { value: JLPTLevel; label: string; icon: string; description: string }[] = [
  {
    value: 'N5',
    label: 'N5 - Beginner',
    icon: 'seedling',
    description: 'Basic vocabulary and grammar',
  },
  {
    value: 'N4',
    label: 'N4 - Elementary',
    icon: 'sprout',
    description: 'Daily conversations',
  },
  {
    value: 'N3',
    label: 'N3 - Intermediate',
    icon: 'run-fast',
    description: 'Everyday situations',
  },
  {
    value: 'N2',
    label: 'N2 - Advanced',
    icon: 'star-outline',
    description: 'News and discussions',
  },
  {
    value: 'N1',
    label: 'N1 - Expert',
    icon: 'star',
    description: 'Complex texts',
  },
];

export default function UserSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { completeSetup } = useUserProfile();

  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep === 1 && !displayName.trim()) {
      Alert.alert('Enter Name', 'Please enter your display name');
      return;
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      await completeSetup({
        display_name: displayName.trim(),
        jlpt_level: selectedLevel,
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Setup error:', error);
      Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const getStepColor = () => {
    return currentStep === 1 ? colors.retroPeach : colors.retroLavender;
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
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {[1, 2].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      step <= currentStep ? colors.primary : colors.textSecondary + '40',
                    borderColor: step === currentStep ? colors.primary : 'transparent',
                  },
                ]}
              />
            ))}
          </View>

          {/* Header */}
          <View style={styles.headerShadowContainer}>
            <View style={[styles.headerShadow, { backgroundColor: colors.primary }]} />
            <View
              style={[
                styles.headerBox,
                {
                  backgroundColor: getStepColor(),
                  borderColor: colors.retroBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.retroBorder,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={currentStep === 1 ? 'account' : 'school'}
                  size={40}
                  color={colors.retroBg}
                />
              </View>
              <Text style={[styles.title, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                {currentStep === 1 ? 'WELCOME!' : 'YOUR LEVEL'}
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.retroBorder, fontFamily: 'VT323' }]}
              >
                {currentStep === 1 ? 'what should we call you?' : 'select your JLPT level'}
              </Text>
            </View>
          </View>

          {/* Step 1: Display Name */}
          {currentStep === 1 && (
            <View style={styles.formShadowContainer}>
              <View style={[styles.formShadow, { backgroundColor: colors.primary }]} />
              <View
                style={[
                  styles.formBox,
                  {
                    backgroundColor: colors.retroLavender,
                    borderColor: colors.retroBorder,
                  },
                ]}
              >
                <AuthInput
                  label="Display Name"
                  placeholder="Enter your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  icon="account"
                  autoCapitalize="words"
                  editable={!loading}
                  maxLength={30}
                />

                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: colors.retroMint,
                      borderColor: colors.retroBorder,
                    },
                  ]}
                >
                  <Text
                    style={[styles.infoText, { color: colors.retroBorder, fontFamily: 'VT323' }]}
                  >
                    ▸ this is how others will see you
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: JLPT Level Selection */}
          {currentStep === 2 && (
            <View style={styles.formShadowContainer}>
              <View style={[styles.formShadow, { backgroundColor: colors.primary }]} />
              <View
                style={[
                  styles.formBox,
                  {
                    backgroundColor: colors.retroPeach,
                    borderColor: colors.retroBorder,
                  },
                ]}
              >
                <View style={styles.levelGrid}>
                  {JLPT_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      onPress={() => setSelectedLevel(level.value)}
                      style={[
                        styles.levelCard,
                        {
                          backgroundColor:
                            selectedLevel === level.value ? colors.primary : colors.retroBg,
                          borderColor:
                            selectedLevel === level.value
                              ? colors.primary
                              : colors.retroBorder,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={level.icon}
                        size={32}
                        color={selectedLevel === level.value ? '#FFFFFF' : colors.primary}
                      />
                      <Text
                        style={[
                          styles.levelLabel,
                          {
                            color: selectedLevel === level.value ? '#FFFFFF' : colors.retroBorder,
                            fontFamily: 'VT323',
                          },
                        ]}
                      >
                        {level.label}
                      </Text>
                      <Text
                        style={[
                          styles.levelDescription,
                          {
                            color:
                              selectedLevel === level.value
                                ? 'rgba(255,255,255,0.9)'
                                : colors.retroBorder,
                            fontFamily: 'VT323',
                          },
                        ]}
                      >
                        {level.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: colors.retroMint,
                      borderColor: colors.retroBorder,
                    },
                  ]}
                >
                  <Text
                    style={[styles.infoText, { color: colors.retroBorder, fontFamily: 'VT323' }]}
                  >
                    ▸ don't worry, you can change this later!
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={handleBack}
                disabled={loading}
                style={[
                  styles.backButtonBox,
                  {
                    backgroundColor: colors.retroMint,
                    borderColor: colors.retroBorder,
                    opacity: loading ? 0.5 : 1,
                    flex: 1,
                  },
                ]}
              >
                <Text style={[styles.backButtonText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                  ← BACK
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.nextButtonContainer, { flex: 1 }]}>
              <View style={[styles.nextShadow, { backgroundColor: colors.primary }]} />
              <TouchableOpacity
                onPress={handleNext}
                disabled={loading}
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.retroBorder,
                    opacity: loading ? 0.6 : 1,
                  },
                ]}
              >
                <Text style={[styles.nextButtonText, { color: '#FFFFFF', fontFamily: 'VT323' }]}>
                  {loading ? 'SAVING...' : currentStep === 2 ? 'FINISH →' : 'NEXT →'}
                </Text>
              </TouchableOpacity>
            </View>
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  progressDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
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
    fontSize: 36,
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
  levelGrid: {
    gap: 12,
    marginBottom: 20,
  },
  levelCard: {
    padding: 16,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  levelLabel: {
    fontSize: 20,
    fontWeight: '400',
    marginTop: 4,
  },
  levelDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoBox: {
    padding: 16,
    borderWidth: 3,
  },
  infoText: {
    fontSize: 18,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  backButtonBox: {
    padding: 16,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '400',
  },
  nextButtonContainer: {
    position: 'relative',
  },
  nextShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
    borderColor: '#000',
    borderRadius: 12,
  },
  nextButton: {
    padding: 16,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 1,
  },
  decorativeFooter: {
    marginTop: 20,
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
});