import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AudioPlayerProps {
  audioUrl?: string;
  startTime?: number;
  endTime?: number;
  label?: string;
}

export function AudioPlayer({ audioUrl, startTime = 0, endTime, label = 'Play Audio' }: AudioPlayerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const playAudio = async () => {
    try {
      if (!audioUrl) {
        console.warn('No audio URL provided');
        return;
      }

      setLoading(true);

      // Stop existing sound if playing
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setPlaying(true);

      // Handle time boundaries if specified
      if (startTime || endTime) {
        await sound.setPositionAsync(startTime);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setLoading(false);
    }
  };

  const onPlaybackStatusUpdate = async (status: any) => {
    if (status.isLoaded) {
      // Stop at end time if specified
      if (endTime && status.positionMillis >= endTime) {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
        }
        setPlaying(false);
      } else if (!status.isPlaying && !status.didJustFinish) {
        setPlaying(status.isPlaying);
      } else if (status.didJustFinish) {
        setPlaying(false);
      }
    }
    setLoading(false);
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
    }
    setPlaying(false);
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.primary }]}
      onPress={playing ? stopAudio : playAudio}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" size="small" />
      ) : (
        <Feather name={playing ? 'pause' : 'play'} size={18} color="#FFF" />
      )}
      <Text style={styles.label}>{playing ? 'Stop' : label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
