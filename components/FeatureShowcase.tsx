import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: 'videocam',
    title: 'Local Video Storage',
    description: 'Store anime episodes directly on your device - no cloud costs',
  },
  {
    icon: 'text',
    title: 'Subtitle Support',
    description: 'Parse SRT and VTT subtitle formats automatically',
  },
  {
    icon: 'finger-print',
    title: 'Tap to Lookup',
    description: 'Tap Japanese words while watching to see definitions',
  },
  {
    icon: 'play-circle',
    title: 'Full Controls',
    description: 'Play, pause, seek, and view subtitle overlays',
  },
  {
    icon: 'hard-drive',
    title: 'Offline Ready',
    description: 'Everything works without internet connection',
  },
  {
    icon: 'trending-up',
    title: 'Progress Tracking',
    description: 'Track your watch progress and learning stats',
  },
];

export const FeatureShowcase = () => {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>🎌 Koji Features</ThemedText>
            <ThemedText style={styles.subtitle}>
              Learn Japanese through anime with our powerful video player
            </ThemedText>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon as any} size={32} color="#B19CD9" />
                </View>
                <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
              </View>
            ))}
          </View>

          {/* How it Works */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>📝 How It Works</ThemedText>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Upload Episode</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Select a video file and optional subtitle file from your device
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Watch with Subtitles</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Play the episode with full video controls and subtitle overlay
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Learn Vocabulary</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Tap on Japanese words to look them up and build your vocabulary
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>4</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Track Progress</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Your watch time, learned words, and stats are saved locally
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Tech Stack */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>⚙️ Technology Stack</ThemedText>

            <View style={styles.techStack}>
              <View style={styles.techBadge}>
                <ThemedText style={styles.techBadgeText}>expo-video</ThemedText>
              </View>
              <View style={styles.techBadge}>
                <ThemedText style={styles.techBadgeText}>expo-file-system</ThemedText>
              </View>
              <View style={styles.techBadge}>
                <ThemedText style={styles.techBadgeText}>expo-sqlite</ThemedText>
              </View>
              <View style={styles.techBadge}>
                <ThemedText style={styles.techBadgeText}>React Native</ThemedText>
              </View>
              <View style={styles.techBadge}>
                <ThemedText style={styles.techBadgeText}>TypeScript</ThemedText>
              </View>
            </View>
          </View>

          {/* Storage Note */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={24} color="#B19CD9" />
            <View style={styles.noteContent}>
              <ThemedText style={styles.noteTitle}>💾 Local Storage</ThemedText>
              <ThemedText style={styles.noteDescription}>
                All videos and data are stored on your device. No cloud costs!
              </ThemedText>
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  featuresGrid: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureCard: {
    width: '50%',
    padding: 8,
  },
  featureCardInner: {
    backgroundColor: '#F5F0FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F0FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B19CD9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#666',
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techBadge: {
    backgroundColor: '#B19CD9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  techBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 12,
    backgroundColor: '#E0D4FF',
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteDescription: {
    fontSize: 12,
    color: '#666',
  },
  spacer: {
    height: 40,
  },
});
