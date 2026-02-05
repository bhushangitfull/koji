/**
 * User Setup Screen - Retro Design
 * Collects user level, name, and bio
 */

import { AuthInput } from '@/components/AuthInput';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LevelOption = 'beginner' | 'intermediate' | 'advanced';

const LEVEL_OPTIONS: { value: LevelOption; label: string; icon: string; description: string }[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    icon: 'seedling',
    description: 'Just starting my Japanese journey',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    icon: 'run-fast',
    description: 'Can understand basic conversations',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    icon: 'star',
    description: 'Comfortable with complex topics',
  },
];

export default function UserSetupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Load VT323 font
  const [fontsLoaded] = useFonts({
    VT323: require('@/assets/fonts/VT323-Regular.ttf'),
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<LevelOption | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep === 1 && !selectedLevel) {
      Alert.alert('Select Level', 'Please select your Japanese level');
      return;
    }

    if (currentStep === 2 && !playerName.trim()) {
      Alert.alert('Enter Name', 'Please enter your player name');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // TODO: Save user data to Supabase
      // import { useUserProfile } from '@/hooks/useUserProfile';
      // const { createProfile } = useUserProfile();
      // await createProfile({
      //   player_name: playerName,
      //   level: selectedLevel!,
      //   bio: bio || undefined,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert('Success', 'Profile setup complete!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const getStepColor = () => {
    if (currentStep === 1) return colors.retroPeach;
    if (currentStep === 2) return colors.retroLavender;
    return colors.retroMint;
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
            {[1, 2, 3].map((step) => (
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
                  name={
                    currentStep === 1
                      ? 'star'
                      : currentStep === 2
                      ? 'account'
                      : 'pencil'
                  }
                  size={40}
                  color={colors.retroBg}
                />
              </View>
              <Text style={[styles.title, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                {currentStep === 1 && 'SELECT YOUR LEVEL'}
                {currentStep === 2 && 'CHOOSE YOUR NAME'}
                {currentStep === 3 && 'TELL US ABOUT YOU'}
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.retroBorder, fontFamily: 'VT323' }]}
              >
                {currentStep === 1 && 'where are you on your journey?'}
                {currentStep === 2 && 'what should we call you?'}
                {currentStep === 3 && 'optional but awesome!'}
              </Text>
            </View>
          </View>

          {/* Step 1: Level Selection */}
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
                <View style={styles.levelGrid}>
                  {LEVEL_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedLevel(option.value)}
                      style={[
                        styles.levelCard,
                        {
                          backgroundColor:
                            selectedLevel === option.value ? colors.primary : colors.retroBg,
                          borderColor:
                            selectedLevel === option.value
                              ? colors.primary
                              : colors.retroBorder,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={option.icon}
                        size={40}
                        color={selectedLevel === option.value ? '#FFFFFF' : colors.primary}
                      />
                      <Text
                        style={[
                          styles.levelLabel,
                          {
                            color: selectedLevel === option.value ? '#FFFFFF' : colors.retroBorder,
                            fontFamily: 'VT323',
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text
                        style={[
                          styles.levelDescription,
                          {
                            color:
                              selectedLevel === option.value
                                ? 'rgba(255,255,255,0.9)'
                                : colors.retroBorder,
                            fontFamily: 'VT323',
                          },
                        ]}
                      >
                        {option.description}
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

          {/* Step 2: Player Name */}
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
                <AuthInput
                  label="Player Name"
                  placeholder="Enter your awesome name"
                  value={playerName}
                  onChangeText={setPlayerName}
                  icon="account"
                  autoCapitalize="words"
                  editable={!loading}
                  maxLength={30}
                />

                <View
                  style={[
                    styles.characterCount,
                    {
                      backgroundColor: colors.retroMint,
                      borderColor: colors.retroBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.characterCountText,
                      { color: colors.retroBorder, fontFamily: 'VT323' },
                    ]}
                  >
                    {playerName.length}/30 characters
                  </Text>
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
                    ▸ this is how others will see you
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Bio */}
          {currentStep === 3 && (
            <View style={styles.formShadowContainer}>
              <View style={[styles.formShadow, { backgroundColor: colors.primary }]} />
              <View
                style={[
                  styles.formBox,
                  {
                    backgroundColor: colors.retroMint,
                    borderColor: colors.retroBorder,
                  },
                ]}
              >
                <View style={styles.bioContainer}>
                  <Text
                    style={[styles.bioLabel, { color: colors.retroBorder, fontFamily: 'VT323' }]}
                  >
                    Your Bio (Optional)
                  </Text>
                  <View
                    style={[
                      styles.bioInputWrapper,
                      {
                        borderColor: colors.primary,
                        backgroundColor: colors.surface,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="text"
                      size={20}
                      color={colors.primary}
                      style={styles.bioIcon}
                    />
                    <TextInput
                      style={[
                        styles.bioInput,
                        {
                          color: colors.text,
                        },
                      ]}
                      onChangeText={setBio}
                      value={bio}
                      numberOfLines={4}
                      multiline
                      placeholder="Tell us about your anime favorites, learning goals, or anything else!"
                      placeholderTextColor={colors.textSecondary}
                      maxLength={200}
                      editable={!loading}
                      textAlignVertical="top"
                    />
                  </View>

                  <View
                    style={[
                      styles.characterCount,
                      {
                        backgroundColor: colors.retroPeach,
                        borderColor: colors.retroBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.characterCountText,
                        { color: colors.retroBorder, fontFamily: 'VT323' },
                      ]}
                    >
                      {bio.length}/200 characters
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: colors.retroPeach,
                      borderColor: colors.retroBorder,
                    },
                  ]}
                >
                  <Text
                    style={[styles.infoText, { color: colors.retroBorder, fontFamily: 'VT323' }]}
                  >
                    ▸ you can always update this later!
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleBack}
              disabled={loading}
              style={[
                styles.backButtonBox,
                {
                  backgroundColor: colors.retroMint,
                  borderColor: colors.retroBorder,
                  opacity: loading ? 0.5 : 1,
                },
              ]}
            >
              <Text style={[styles.backButtonText, { color: colors.retroBorder, fontFamily: 'VT323' }]}>
                ← BACK
              </Text>
            </TouchableOpacity>

            <View style={styles.nextButtonContainer}>
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
                  {currentStep === 3 ? 'FINISH →' : 'NEXT →'}
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
    gap: 16,
    marginBottom: 20,
  },
  levelCard: {
    padding: 20,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  levelLabel: {
    fontSize: 24,
    fontWeight: '400',
    marginTop: 8,
  },
  levelDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  bioContainer: {
    marginBottom: 20,
  },
  bioLabel: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 12,
  },
  bioInputWrapper: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    minHeight: 100,
    alignItems: 'flex-start',
  },
  bioIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  bioInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'VT323',
    minHeight: 80,
  },
  characterCount: {
    padding: 8,
    borderWidth: 2,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  characterCountText: {
    fontSize: 14,
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
    flex: 1,
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
    flex: 1,
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