// components/VideoPlayer.tsx - IMPROVED VERSION
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

  // DEBUG: Log first subtitle text before render
  useEffect(() => {
    if (subtitles && subtitles.length > 0) {
      console.log('[RENDER DEBUG] First subtitle text:', subtitles[0].text);
    } else {
      console.log('[RENDER DEBUG] No subtitles available');
    }
  }, [subtitles]);

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
  // Frequently, player.duration isn't ready at mount. 
  // This watcher catches it when the video metadata loads.
  if (player.duration > 0 && duration === 0) {
    setDuration(player.duration);
  }
}, [player.duration, duration]);

  // CRITICAL DEBUG: Log subtitles on mount
  useEffect(() => {
    console.log('===== VideoPlayer Subtitle Debug =====');
    console.log('Subtitle count:', subtitles.length);
    console.log('First 3 subtitles:', subtitles.slice(0, 3));
    console.log('Subtitle data types:', {
      hasSubtitles: subtitles.length > 0,
      firstSubtitle: subtitles[0],
      firstStartTime: subtitles[0]?.startTime,
      firstStartTimeType: typeof subtitles[0]?.startTime,
      firstText: subtitles[0]?.text,
    });
    console.log('======================================');
  }, [subtitles]);

  // Debug subtitle matching on changes
  useEffect(() => {
    console.log('[Subtitle Match] Current subtitle:', {
      matched: currentSubtitle?.text?.substring(0, 50),
      index: currentSubtitle?.index,
      startTime: currentSubtitle?.startTime,
      endTime: currentSubtitle?.endTime,
      playerTime: currentTime,
    });
  }, [currentSubtitle, currentTime]);

  useEffect(() => {
  let interval: NodeJS.Timeout;

  if (isPlaying && !isDragging.current) {
    // Manually poll the player's current time every 500ms
    interval = setInterval(() => {
      const time = player.currentTime;
      setCurrentTime(time);

      // Trigger Subtitle Match
      if (subtitles.length > 0) {
        const matched = getSubtitleAtTime(subtitles, time * 1000);
        if (matched?.index !== currentSubtitle?.index) {
          setCurrentSubtitle(matched);
        }
      }
    }, 500);
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isPlaying, player, subtitles, currentSubtitle]);

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

  useEffect(() => {
  // If the player is already loaded but state is 0, sync it manually
  if (player.duration > 0 && duration === 0) {
    setDuration(player.duration);
  }
}, [player.duration]);

  const toggleRotation = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch (error) {
      console.error('Failed to change orientation:', error);
    }
  };

  // 2. Listen for Metadata/Status changes
  useEventListener(player, 'statusChange', (event) => {
    if (event.status === 'readyToPlay' && player.duration > 0) {
      setDuration(player.duration);
    }
  });

  useEventListener(player, 'playingChange', (event) => {
    setIsPlaying(event.isPlaying);
  });



useEventListener(player, 'timeUpdate', (event) => {
  // If manual buttons work but playback doesn't, 
  // we must ensure the state is actually being set here.
  const newTime = event.currentTime;
  
  // Update the progress bar and time text
  setCurrentTime(newTime);
  
  // Trigger subtitle logic
  if (subtitles && subtitles.length > 0) {
    const timeMs = newTime * 1000;
    const subtitle = getSubtitleAtTime(subtitles, timeMs);
    
    if (subtitle?.index !== currentSubtitle?.index) {
      setCurrentSubtitle(subtitle);
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
        const percent = Math.max(0, Math.min(gestureState.moveX / (barWidth || 1), 1));
        setCurrentTime(percent * duration);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const percent = Math.max(0, Math.min(gestureState.moveX / (barWidth || 1), 1));
        seekTo(percent * duration);
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
// console.log('DRAG STATUS:', isDragging.current);
// console.log('TIME SYNC:', currentTime, '/', duration);



  return (
    <View style={styles.container}>
      <VideoView player={player} style={styles.video} nativeControls={false} surfaceType="textureView" />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Subtitle Display - IMPROVED VISIBILITY */}
        {currentSubtitle && (
          <View style={styles.subtitleWrapper}>
            <View style={[styles.subtitleContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}> 
              <Text 
                style={[
                  styles.subtitleText,
                  {
                    color: '#FFEB3B', // Bright yellow for visibility
                    fontSize: 28,
                    textShadowColor: '#000',
                    textShadowOffset: { width: 2, height: 2 },
                    textShadowRadius: 4,
                  },
                ]}
                numberOfLines={0}
              >
                {currentSubtitle.text}
              </Text>
            </View>
          </View>
        )}


        {/* Debug indicator when no subtitles are available */}
        {subtitles.length === 0 && (
          <View style={styles.subtitleWrapper}>
            <View style={[styles.subtitleContainer, { backgroundColor: 'rgba(255, 0, 0, 0.8)' }]}>
              <Text style={styles.subtitleText}>⚠️ No subtitles loaded</Text>
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
              <View
                style={[
                  styles.fill,
                  { width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }
                ]}
              />
              <View
                style={[
                  styles.knob,
                  { left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }
                ]}
              />
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingVertical: 0
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 12
  },
  rotationBtn: { padding: 8 },
  bottomBar: { paddingHorizontal: 20, paddingBottom: 20 },
  controlsContainer: { marginBottom: 12 },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  smallPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  smallBtn: { padding: 8 },
  sliderWrapper: { height: 40, justifyContent: 'center', marginVertical: 8 },
  track: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative'
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFB6D9',
    borderRadius: 2
  },
  knob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFB6D9',
    top: -6,
    marginLeft: -8
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  time: { color: 'white', fontSize: 12 },
  fullscreenBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtitleWrapper: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'none',
    paddingHorizontal: 12,
  },
  subtitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '95%',
  },
  subtitleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
    lineHeight: 24,
  },
});