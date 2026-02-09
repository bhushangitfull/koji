// app/player.tsx
import VideoPlayer from '@/components/VideoPlayer';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEpisodeUpload } from '@/hooks/useEpisodeUpload';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
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

  // Parse subtitles if available
  const subtitles = episode.subtitles?.map(sub => ({
    index: sub.index,
    startTime: sub.startTime || 0,
    endTime: sub.endTime || 0,
    text: sub.text || '',
    startTimeStr: sub.startTimeStr || '',
    endTimeStr: sub.endTimeStr || '',
  })) || [];

  console.log('Player Screen Debug:', {
    episodeId,
    episodeTitle: episode.title,
    hasSubtitles: episode.subtitles && episode.subtitles.length > 0,
    subtitleCount: episode.subtitles?.length || 0,
    subtitles: subtitles.slice(0, 3), // First 3 for debugging
  });

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