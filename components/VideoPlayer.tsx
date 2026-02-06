import { Ionicons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CustomPlayer({ videoUri, title, onBack }) {
  const isDragging = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Initialize the Expo Video Player
  const player = useVideoPlayer(videoUri, (p) => {
    p.play();
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0); 
  const [controlsVisible, setControlsVisible] = useState(true);
  const isDragging = useRef(false);

  // 2. Listeners
  useEventListener(player, 'playingChange', (event) => setIsPlaying(event.isPlaying));
  
  useEventListener(player, 'timeUpdate', (event) => {
    // ONLY update state from the player if we aren't currently sliding
    if (!isDragging.current) {
      setCurrentTime(event.currentTime);
      if (duration === 0) setDuration(player.duration);
    }
  });

  // 3. Seeking Logic (FIXED)
  const seekTo = (seconds: number) => {
    const newTime = Math.max(0, Math.min(seconds, player.duration));
    // Step A: Update the native player
    player.currentTime = newTime; 
    // Step B: Update local state immediately so the UI doesn't jump back
    setCurrentTime(newTime);
  };

  const handleSkip = (amount: number) => {
    seekTo(player.currentTime + amount);
  };

  // 4. Slider Logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const padding = 20;
        const barWidth = windowWidth - (padding * 2);
        const touchX = evt.nativeEvent.pageX - padding;
        const percent = Math.max(0, Math.min(touchX / barWidth, 1));
        
        // Update UI locally while dragging
        setCurrentTime(percent * player.duration);
      },
      onPanResponderRelease: (evt) => {
        const padding = 20;
        const barWidth = windowWidth - (padding * 2);
        const touchX = evt.nativeEvent.pageX - padding;
        const percent = Math.max(0, Math.min(touchX / barWidth, 1));
        
        seekTo(percent * player.duration);
        isDragging.current = false;
      },
    })
  ).current;

  const formatTime = (secs: number) => {
    const s = Math.floor(secs || 0);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <VideoView player={player} style={styles.video} nativeControls={false} />

      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack}><Ionicons name="arrow-back" size={28} color="white" /></TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Center Controls */}
        <View style={styles.centerRow}>
          <TouchableOpacity onPress={() => handleSkip(-10)} style={styles.btn}>
            <Ionicons name="play-back" size={40} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => isPlaying ? player.pause() : player.play()} style={styles.playBtn}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={50} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSkip(10)} style={styles.btn}>
            <Ionicons name="play-forward" size={40} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.sliderWrapper} {...panResponder.panHandlers}>
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