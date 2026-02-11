// components/VideoPlayer.tsx - FIXED UI LAYOUT
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
  return (
    <View style={styles.container}>
      <VideoView 
        player={player} 
        style={styles.video} 
        nativeControls={false} 
        contentFit="contain"
      />

      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <TouchableOpacity onPress={toggleRotation}>
            <Ionicons 
              name={isLandscape ? "contract-outline" : "expand-outline"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* FIXED: Subtitle Display - Positioned higher, smaller text */}
        {currentSubtitle ? (
          <View style={styles.subtitleWrapper}>
            <View style={styles.subtitleContainer}>
              <Text 
                style={styles.subtitleText}
                numberOfLines={0}
              >
                {currentSubtitle.text}
              </Text>
            </View>
          </View>
        ) : (
          // Debug indicator when no subtitle is active
          subtitles.length > 0 && __DEV__ && (
            <View style={styles.subtitleWrapper}>
              <View style={[styles.subtitleContainer, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
                <Text style={[styles.subtitleText, { fontSize: 10, fontStyle: 'italic' }]}>
                  {`Waiting... (${subtitles.length} available)`}
                </Text>
              </View>
            </View>
          )
        )}

        {/* FIXED: Bottom Controls - Compact layout */}
        <View style={styles.bottomBar}>
          {/* Progress Bar First */}
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

          {/* Time and Controls Row */}
          <View style={styles.bottomRow}>
            {/* Time Display */}
            <Text style={styles.time}>{formatTime(currentTime)}</Text>

            {/* Playback Controls */}
            <View style={styles.centerRow}>
              <TouchableOpacity onPress={() => handleSkip(-10)} style={styles.smallBtn}>
                <Ionicons name="play-back" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => isPlaying ? player.pause() : player.play()}
                style={styles.playBtn}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSkip(10)} style={styles.smallBtn}>
                <Ionicons name="play-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Duration */}
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  video: { 
    flex: 1 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'space-between',
    paddingVertical: 0
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 12
  },
  
  // FIXED: Subtitle positioning - higher up, no overlap with controls
  subtitleWrapper: {
    position: 'absolute',
    bottom: 100, // Moved up from 120
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'none',
    paddingHorizontal: 20,
  },
  subtitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    maxWidth: '90%',
    alignItems: 'center',
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 16, // Reduced from 18-28
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // FIXED: Bottom controls - compact and organized
  bottomBar: { 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  sliderWrapper: { 
    height: 32, 
    justifyContent: 'center', 
    marginBottom: 8 
  },
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
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFB6D9',
    top: -5,
    marginLeft: -7
  },
  
  // NEW: Combined bottom row with time, controls, and duration
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  smallBtn: { 
    padding: 8 
  },
  time: { 
    color: 'white', 
    fontSize: 13,
    fontWeight: '600',
    minWidth: 45,
  },
});