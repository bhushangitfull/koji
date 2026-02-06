import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CustomPlayer({ videoUri, title, onBack }) {
  const isDragging = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Initialize the Expo Video Player
  const player = useVideoPlayer(videoUri, (p) => {
    p.play();
  });

  // Sync the UI with the native player
  useEffect(() => {
    const timeSub = player.addListener('timeUpdate', (event) => {
      if (!isDragging.current) {
        setCurrentTime(event.currentTime);
      }
    });

    const statusSub = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });

    // Listen for source changes to get duration
    const sourceSub = player.addListener('sourceChange', (event) => {
      if (event.newSource && player.duration > 0) {
        setDuration(player.duration);
      }
    });

    // Also listen for status changes which may indicate duration is ready
    const statusChangeSub = player.addListener('statusChange', (event) => {
      if (event.status === 'readyToPlay' && player.duration > 0) {
        setDuration(player.duration);
      }
    });

    // Try to get duration immediately if already loaded
    if (player.duration > 0 && duration === 0) {
      setDuration(player.duration);
    }

    return () => {
      timeSub.remove();
      statusSub.remove();
      sourceSub.remove();
      statusChangeSub.remove();
    };
  }, [player]);

  const handleSkip = (amount: number) => {
    // Use the state duration instead of player.duration directly
    const videoDuration = duration > 0 ? duration : player.duration;
    const newTime = Math.max(0, Math.min(player.currentTime + amount, videoDuration));
    player.currentTime = newTime;
    // Update UI immediately for responsiveness
    setCurrentTime(newTime);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        isDragging.current = true;
        const pos = (evt.nativeEvent.pageX - 20) / (SCREEN_WIDTH - 40);
        const videoDuration = duration > 0 ? duration : player.duration;
        setCurrentTime(Math.max(0, Math.min(pos, 1)) * videoDuration);
      },
      onPanResponderRelease: (evt) => {
        const pos = (evt.nativeEvent.pageX - 20) / (SCREEN_WIDTH - 40);
        const videoDuration = duration > 0 ? duration : player.duration;
        const newTime = Math.max(0, Math.min(pos, 1)) * videoDuration;
        player.currentTime = newTime;
        isDragging.current = false;
      },
    })
  ).current;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <VideoView player={player} style={styles.video} nativeControls={false} />
      
      <View style={styles.uiLayer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={() => handleSkip(-10)}>
            <MaterialIcons name="replay-10" size={45} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.playBtn} 
            onPress={() => isPlaying ? player.pause() : player.play()}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={54} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSkip(10)}>
            <MaterialIcons name="forward-10" size={45} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          <View style={styles.progressBar} {...panResponder.panHandlers}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { ...StyleSheet.absoluteFillObject },
  uiLayer: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50 },
  title: { color: 'white', fontSize: 18, marginLeft: 10, fontWeight: 'bold' },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  playBtn: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 30 
  },
  footer: { paddingBottom: 40 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: { 
    height: 10, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    borderRadius: 5, 
    overflow: 'hidden' 
  },
  progressFill: { height: '100%', backgroundColor: '#3b82f6' }
});