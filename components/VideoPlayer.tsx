import { getSubtitleAtTime, Subtitle } from '@/utils/subtitleParser';
import { Ionicons } from '@expo/vector-icons';
import { useEvent, useEventListener } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
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

interface CustomPlayerProps {
  videoUri: string;
  title: string;
  subtitles?: Subtitle[];
  onBack: () => void;
}

export default function CustomPlayer({ videoUri, title, subtitles = [], onBack }: CustomPlayerProps) {

  const isDragging = useRef(false);


  // 1. Consolidated State
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);


  const player = useVideoPlayer(videoUri, (p) => {
    p.play();
  });

  const { status } = useEvent(player, 'statusChange', { status: player.status });

  useEffect(() => {
    if (status === 'readyToPlay' && player.duration > 0) {
      setDuration(player.duration);
    }
  }, [status, player.duration]);

  // Debug: Log subtitles on mount and when they change
  useEffect(() => {
    console.log('VideoPlayer Mounted:', {
      subtitleCount: subtitles.length,
      firstSubtitle: subtitles[0],
      subtitles: subtitles.slice(0, 3),
    });
  }, [subtitles]);

  // Handle screen orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      const { width, height } = Dimensions.get('window');
      setIsLandscape(width > height);
    });

    return () => subscription?.remove();
  }, []);

    useEffect(() => {
     return () => {
       ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(
         error => console.error('Failed to reset orientation on unmount:', error)
       );
     };
   }, []);

  const toggleRotation = async () => {
    try {
      if (isLandscape) {
        // Return to portrait
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        // Go to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch (error) {
      console.error('Failed to change orientation:', error);
    }
  };

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
      
      // Update current subtitle based on timestamp (convert to milliseconds)
      if (subtitles.length > 0) {
        const timeMs = event.currentTime * 1000;
        const subtitle = getSubtitleAtTime(subtitles, timeMs);
        setCurrentSubtitle(subtitle);
        
        // Debug logging (remove in production)
        if (subtitle && Math.random() < 0.1) { // Log 10% of updates to avoid spam
          console.log('Subtitle Found:', {
            currentTimeMs: timeMs,
            subtitle: subtitle.text.substring(0, 50),
          });
        }
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
          <TouchableOpacity onPress={toggleRotation} style={styles.rotationBtn}>
            <Ionicons name={isLandscape ? "contract" : "expand"} size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Subtitle Display - Inside overlay, centered and above controls */}
        {currentSubtitle && (
          <View style={styles.subtitleWrapper}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>{currentSubtitle.text}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomBar}>
          <View style={styles.controlsContainer}>
            <View style={styles.centerRow}>
              <TouchableOpacity onPress={() => handleSkip(-10)} style={styles.smallBtn}>
                <Ionicons name="play-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => isPlaying ? player.pause() : player.play()}
                style={styles.smallPlayBtn}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSkip(10)} style={styles.smallBtn}>
                <Ionicons name="play-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

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
            <TouchableOpacity onPress={toggleRotation} style={styles.fullscreenBtn}>
              <Ionicons name={isLandscape ? "contract-outline" : "expand-outline"} size={20} color="white" />
            </TouchableOpacity>
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'space-between', paddingVertical: 0 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 20 },
  title: { color: 'white', fontSize: 18, fontWeight: 'bold', flex: 1, marginHorizontal: 12 },
  rotationBtn: { padding: 8 },
  bottomBar: { paddingHorizontal: 20, paddingBottom: 20 },
  controlsContainer: { marginBottom: 12 },
  centerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 },
  smallPlayBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  smallBtn: { padding: 8 },
  sliderWrapper: { height: 40, justifyContent: 'center', marginVertical: 8 },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, position: 'relative' },
  fill: { height: '100%', backgroundColor: '#FFB6D9', borderRadius: 2 },
  knob: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFB6D9', top: -6, marginLeft: -8 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  time: { color: 'white', fontSize: 12 },
  fullscreenBtn: { padding: 8, alignItems: 'center', justifyContent: 'center' },
  subtitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  subtitleContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  subtitleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
    maxWidth: '90%',
  },
});