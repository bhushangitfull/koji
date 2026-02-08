import { Ionicons } from '@expo/vector-icons';
import { useEvent, useEventListener } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: windowWidth } = Dimensions.get('window');

export default function CustomPlayer({ videoUri, title, onBack }) {

  const isDragging = useRef(false);


  // 1. Consolidated State
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [barWidth, setBarWidth] = useState(0);


  const player = useVideoPlayer(videoUri, (p) => {
    p.play();
  });

  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (status === 'readyToPlay' && player.duration > 0) {
      setDuration(player.duration);
    }
  }, [status, player.duration]);

  // 2. Listen for Metadata/Status changes
  // This ensures duration updates as soon as the video loads
  useEventListener(player, 'statusChange', (event) => {
    if (event.status === 'readyToPlay') {
      setDuration(player.duration);
    }
  });

  useEventListener(player, 'playingChange', (event) => {
    setIsPlaying(event.isPlaying);
  });

  useEventListener(player, 'timeUpdate', (event) => {
    if (!isDragging.current) {
      setCurrentTime(event.currentTime);
      // Fallback: update duration if it was missed during statusChange
      if (duration === 0 && player.duration > 0) {
        setDuration(player.duration);
      }
    }
  });

  const seekTo = (seconds) => {
    if (!player || duration <= 0) return;
    const newTime = Math.max(0, Math.min(seconds, duration));

    player.currentTime = newTime;
    setCurrentTime(newTime);

    // Android Fix: Ensure player doesn't stick in pause after seek
    if (isPlaying) {
      setTimeout(() => player.play(), 50);
    }
  };



  const handleSkip = (amount) => {
    seekTo(player.currentTime + amount);
  };

  // 3. Slider Logic with dragging safety
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Use moveX (absolute) and subtract the slider's start position
        // For simplicity, if full-screen: (gestureState.moveX / barWidth)
        const percent = Math.max(0, Math.min(gestureState.moveX / (barWidth || 1), 1));
        setCurrentTime(percent * duration);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const percent = Math.max(0, Math.min(gestureState.moveX / (barWidth || 1), 1));
        seekTo(percent * duration);
        // Give the native player a moment to catch up before resuming timeUpdates
        setTimeout(() => { isDragging.current = false; }, 200);
      },
    })
  ).current;

  const formatTime = (secs) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container} >
      <VideoView player={player} style={styles.video} nativeControls={false} surfaceType="textureView" />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.centerRow}>
          <TouchableOpacity onPress={() => handleSkip(-10)} style={styles.btn}>
            <Ionicons name="play-back" size={40} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => isPlaying ? player.pause() : player.play()}
            style={styles.playBtn}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={50} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSkip(10)} style={styles.btn}>
            <Ionicons name="play-forward" size={40} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <View
            style={styles.sliderWrapper}
            {...panResponder.panHandlers}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(currentTime / (duration || 1)) * 100}%` }]} />
              <View style={[styles.knob, { left: `${(currentTime / (duration || 1)) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20 },
  title: { color: 'white', fontSize: 18, marginLeft: 15, fontWeight: 'bold' },
  centerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  playBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', marginHorizontal: 20 },
  btn: { padding: 10 },
  bottomBar: { paddingHorizontal: 20, paddingBottom: 40 },
  sliderWrapper: { height: 40, justifyContent: 'center' },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, position: 'relative' },
  fill: { height: '100%', backgroundColor: '#FFB6D9', borderRadius: 2 },
  knob: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFB6D9', top: -6, marginLeft: -8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  time: { color: 'white', fontSize: 12 }
});