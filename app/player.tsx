 import { VideoPlayer } from '@/components/VideoPlayer';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEpisodeUpload } from '@/hooks/useEpisodeUpload';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlayerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const { episodes } = useEpisodeUpload();

  // Lock orientation to portrait when entering this screen
  useEffect(() => {
    const setupOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } catch (err) {
        console.error('Error setting orientation:', err);
      }
    };
    
    setupOrientation();

    // Cleanup: ensure portrait orientation when leaving this screen
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(err => {
        console.error('Error restoring orientation on unmount:', err);
      });
    };
  }, []);

  useEffect(() => {
    console.log('Player screen - episodeId:', episodeId);
    console.log('Player screen - episodes:', episodes.map(e => ({ id: e.id, title: e.title, uri: e.videoUri })));
  }, [episodeId, episodes]);

  const episode = episodes.find((e) => e.id === episodeId);

  const handleBack = async () => {
    try {
      // Ensure portrait before navigating back
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      router.back();
    } catch (err) {
      console.error('Error on back:', err);
      router.back();
    }
  };

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
          onPress={handleBack}
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
        onPress={handleBack}
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