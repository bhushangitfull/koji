import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useEpisodeUpload } from '@/hooks/useEpisodeUpload';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PlayerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const { episodes } = useEpisodeUpload();

  useEffect(() => {
    console.log('Player screen - episodeId:', episodeId);
    console.log('Player screen - episodes:', episodes.map(e => ({ id: e.id, title: e.title, uri: e.videoUri })));
  }, [episodeId, episodes]);

  const episode = episodes.find((e) => e.id === episodeId);

  if (!episode) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.primary }]}>Episode not found</Text>
          <Text style={[styles.errorSubtext, { color: '#999' }]}>ID: {episodeId}</Text>
          <Text style={[styles.errorSubtext, { color: '#999' }]}>
            Available: {episodes.length} episodes
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="x" size={28} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  console.log('Rendering video player with URI:', episode.videoUri);

  return (
    <View style={styles.container}>
      <VideoPlayer
        videoUri={episode.videoUri}
        title={episode.title}
        subtitles={episode.subtitles}
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Feather name="x" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerContainer: {
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
    top: 16,
    right: 16,
    zIndex: 1000,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
  },
});
