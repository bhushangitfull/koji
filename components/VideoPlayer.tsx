import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  GestureResponderEvent,
  Platform,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Subtitle, getSubtitleAtTime } from '@/utils/subtitleParser';

const { width, height } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUri: string;
  subtitles?: Subtitle[];
  onTimeUpdate?: (currentTime: number) => void;
  title?: string;
}

interface WordDefinition {
  word: string;
  hiragana?: string;
  english?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUri,
  subtitles = [],
  onTimeUpdate,
  title,
}) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [showWordModal, setShowWordModal] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time regularly
  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      if (player && isPlaying) {
        setCurrentTime(player.currentTime);
      }
    }, 100);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [player, isPlaying]);

  // Auto-play when player is ready
  useEffect(() => {
    if (isPlayerReady && !isPlaying) {
      try {
        player.play();
      } catch (err) {
        console.error('Auto-play error:', err);
      }
    }
  }, [isPlayerReady]);

  // Reset player state when videoUri changes
  useEffect(() => {
    setIsPlayerReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayerError(null);
  }, [videoUri]);

  // Update current subtitle
  useEffect(() => {
    if (subtitles.length > 0) {
      const subtitle = getSubtitleAtTime(subtitles, currentTime);
      setCurrentSubtitle(subtitle || null);
    }
  }, [currentTime, subtitles]);

  // Update onTimeUpdate callback
  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  // Auto-hide controls
  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 5000);
  };

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Play/Pause error:', err);
    }
    showControls();
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressPress = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    const progressWidth = width - 30;
    const percentage = Math.max(0, Math.min(1, locationX / progressWidth));
    const newTime = percentage * duration;
    player.currentTime = newTime;
    setCurrentTime(newTime);
    showControls();
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    showControls();
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
    showControls();
  };

  const skipForward = (seconds: number = 10) => {
    const newTime = Math.min(currentTime + seconds * 1000, duration);
    player.currentTime = newTime;
    setCurrentTime(newTime);
    showControls();
  };

  const skipBackward = (seconds: number = 10) => {
    const newTime = Math.max(currentTime - seconds * 1000, 0);
    player.currentTime = newTime;
    setCurrentTime(newTime);
    showControls();
  };

  return (
    <View style={styles.container}>
      {/* Video Container */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          onStatusUpdate={(status) => {
            if (!isPlayerReady && status.isReady) {
              setIsPlayerReady(true);
            }
            setDuration(status.duration);
            // Only update playing state from video status
            setIsPlaying(status.isPlaying);
          }}
        />

        {/* Loading Indicator - Only show if NOT ready AND NOT playing */}
        {!isPlayerReady && !isPlaying && (
          <View style={styles.centerOverlay}>
            <ActivityIndicator size="large" color="#FFB6D9" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Error Display */}
        {playerError && (
          <View style={styles.centerOverlay}>
            <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{playerError}</Text>
          </View>
        )}

        {/* Tap Area to Show Controls */}
        <TouchableOpacity
          style={styles.tapArea}
          onPress={showControls}
          activeOpacity={0.1}
        />

        {/* Subtitle Display */}
        {currentSubtitle && (
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleText}>{currentSubtitle.text}</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {controlsVisible && (
          <View style={styles.controlsWrapper}>
            {/* Title Bar */}
            {title && (
              <View style={styles.titleBar}>
                <Text style={styles.titleText}>{title}</Text>
              </View>
            )}

            {/* Center Play/Pause Overlay */}
            <TouchableOpacity
              style={styles.centerPlayArea}
              onPress={togglePlayPause}
              activeOpacity={0.7}
            >
              <View style={styles.playIconBackground}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={50}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>

            {/* Bottom Control Bar */}
            <View style={styles.bottomControls}>
              {/* Progress Bar */}
              <TouchableOpacity
                style={styles.progressContainer}
                onPress={handleProgressPress}
                onPressIn={handleSeekStart}
                onPressOut={handleSeekEnd}
                disabled={isSeeking}
              >
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {/* Control Buttons Row */}
              <View style={styles.controlsRow}>
                {/* Play/Pause Button */}
                <TouchableOpacity
                  onPress={togglePlayPause}
                  style={styles.playButton}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={26}
                    color="#fff"
                  />
                </TouchableOpacity>

                {/* Skip Backward */}
                <TouchableOpacity
                  onPress={() => skipBackward(10)}
                  style={styles.skipButton}
                >
                  <Ionicons name="play-back" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Time Display */}
                <Text style={styles.timeDisplay}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>

                {/* Skip Forward */}
                <TouchableOpacity
                  onPress={() => skipForward(10)}
                  style={styles.skipButton}
                >
                  <Ionicons name="play-forward" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Fullscreen Button */}
                <TouchableOpacity
                  onPress={toggleFullscreen}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={isFullscreen ? 'contract' : 'expand'}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Word Lookup Modal */}
      <Modal
        visible={showWordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWordModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Word Lookup</Text>
              <TouchableOpacity onPress={() => setShowWordModal(false)}>
                <Ionicons name="close" size={28} color="#B19CD9" />
              </TouchableOpacity>
            </View>

            {selectedWord && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.wordSection}>
                  <Text style={styles.wordText}>{selectedWord.word}</Text>
                  <Text style={styles.hiraganaText}>{selectedWord.hiragana}</Text>
                  <Text style={styles.englishText}>{selectedWord.english}</Text>
                </View>

                <View style={styles.exampleSection}>
                  <Text style={styles.sectionTitle}>Example Sentences</Text>
                  <Text style={styles.placeholder}>
                    Examples would appear here
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitleContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    zIndex: 3,
  },
  subtitleText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  // Controls Wrapper
  controlsWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  titleBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerPlayArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  // Progress Bar
  progressContainer: {
    marginBottom: 12,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFB6D9',
    borderRadius: 2,
  },
  // Control Buttons Row
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skipButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  timeDisplay: {
    color: '#fff',
    fontSize: 12,
    minWidth: 100,
    marginLeft: 4,
    fontVariant: ['tabular-nums'],
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFACD',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B19CD9',
  },
  modalBody: {
    padding: 16,
  },
  wordSection: {
    marginBottom: 20,
  },
  wordText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  hiraganaText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  englishText: {
    fontSize: 16,
    color: '#B19CD9',
    fontWeight: '600',
  },
  exampleSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
