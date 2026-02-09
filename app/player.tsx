// app/player.tsx - FIXED VERSION
import VideoPlayer from '@/components/VideoPlayer';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEpisodeUpload } from '@/hooks/useEpisodeUpload';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlayerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const { episodes } = useEpisodeUpload();

  const episode = episodes.find((e) => e.id === episodeId);

  const handleBack = () => {
    router.back();
  };

  // Parse and validate subtitles - THIS IS THE KEY FIX
const subtitles = useMemo(() => {
  if (!episode?.subtitles || episode.subtitles.length === 0) {
    console.log('Player: No subtitles available yet.');
    return [];
  }
  return episode.subtitles;
}, [episode?.subtitles]);

  console.log('Processed subtitles for player:', {
    count: subtitles.length,
    firstThree: subtitles.slice(0, 3),
    firstSubtitleTime: subtitles[0]?.startTime,
    lastSubtitleTime: subtitles[subtitles.length - 1]?.endTime,
  });

  if (!episode) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.primary }]}>
            Episode not found
          </Text>
          <Text style={[styles.errorSubtext, { color: '#999' }]}>
            ID: {episodeId}
          </Text>
          <Text style={[styles.errorSubtext, { color: '#999' }]}>
            Available: {episodes.length} episodes
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Feather name="x" size={28} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoPlayer
        videoUri={episode.videoUri}
        title={episode.title}
        subtitles={subtitles}
        onBack={handleBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1000,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
  },
});