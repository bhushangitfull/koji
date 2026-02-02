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
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Subtitle, getSubtitleAtTime } from '@/utils/subtitleParser';

const { width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUri: string;
  subtitles?: Subtitle[];
  onTimeUpdate?: (currentTime: number) => void;
  title?: string;
  onBack?: () => void;
  onTextSelect?: (text: string) => void;
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
  onBack,
  onTextSelect,
}) => {
  const player = useVideoPlayer(videoUri, (player) => {
    player.loop = false;
  });

  // State Management
  const [isPlayerReady, setIsPlayerReady] = useState(false);
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
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [selectedText, setSelectedText] = useState('');

  // Refs
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Setup time tracking
  useEffect(() => {
    if (!isPlayerReady || !player) return;

    updateIntervalRef.current = setInterval(() => {
      try {
        if (!isSeeking) {
          const currentTime = player.currentTime || 0;
          const duration = player.duration || 0;

          setCurrentTime(currentTime * 1000); // Convert to ms
          if (duration > 0) {
            setDuration(duration * 1000); // Convert to ms
          }
        }
      } catch (err) {
        console.error('Update time error:', err);
      }
    }, 100);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [player, isPlayerReady, isSeeking]);

  // Auto-play when ready
  useEffect(() => {
    if (isPlayerReady && !isPlaying) {
      try {
        player.play();
      } catch (err) {
        console.error('Auto-play error:', err);
      }
    }
  }, [isPlayerReady]);

  // Reset on video change
  useEffect(() => {
    setIsPlayerReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayerError(null);
  }, [videoUri]);

  // Update subtitles
  useEffect(() => {
    if (subtitles.length > 0) {
      const subtitle = getSubtitleAtTime(subtitles, currentTime + subtitleOffset * 1000);
      setCurrentSubtitle(subtitle || null);
    }
  }, [currentTime, subtitles, subtitleOffset]);

  // Callback
  useEffect(() => {
    onTimeUpdate?.(currentTime);
  }, [currentTime, onTimeUpdate]);

  // Monitor player status for ready state
  useEffect(() => {
    const checkPlayerReady = setInterval(() => {
      try {
        if (player && player.duration && player.duration > 0 && !isPlayerReady) {
          setIsPlayerReady(true);
          setDuration(player.duration * 1000);
        }
      } catch (err) {
        console.error('Player ready check error:', err);
      }
    }, 500);

    return () => clearInterval(checkPlayerReady);
  }, [player, isPlayerReady]);

  // Controls visibility
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

  // Play/Pause
  const togglePlayPause = () => {
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error('Play/Pause error:', err);
    }
    showControls();
  };

  // Format time
  const formatTime = (ms: number): string => {
    if (isNaN(ms) || !isFinite(ms)) return '00:00';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Seek to time
  const seekToTime = (timeInSeconds: number) => {
    try {
      if (!isNaN(timeInSeconds) && isFinite(timeInSeconds)) {
        const clampedTime = Math.max(0, Math.min(timeInSeconds, duration / 1000));
        player.currentTime = clampedTime;
        setCurrentTime(clampedTime * 1000);
      }
    } catch (err) {
      console.error('Seek error:', err);
    }
  };

  // Progress bar press
  const handleProgressPress = (event: GestureResponderEvent) => {
    try {
      const { locationX } = event.nativeEvent;
      const progressWidth = screenWidth - 30;
      const percentage = Math.max(0, Math.min(1, locationX / progressWidth));
      const newTimeInSeconds = (percentage * duration) / 1000;

      seekToTime(newTimeInSeconds);
      showControls();
    } catch (err) {
      console.error('Progress press error:', err);
    }
  };

  // Skip buttons
  const skipForward = (seconds: number) => {
    const newTime = Math.min((currentTime + seconds * 1000) / 1000, duration / 1000);
    seekToTime(newTime);
    showControls();
  };

  const skipBackward = (seconds: number) => {
    const newTime = Math.max((currentTime - seconds * 1000) / 1000, 0);
    seekToTime(newTime);
    showControls();
  };

  // Adjust subtitle offset
  const adjustSubtitleOffset = (direction: number) => {
    setSubtitleOffset(subtitleOffset + direction * 0.5);
  };

  // Fullscreen toggle
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

  // Handle text selection from subtitle
  const handleTextSelect = (text: string) => {
    setSelectedText(text);
    if (onTextSelect) {
      onTextSelect(text);
    }
  };

  const handleClearSelection = () => {
    setSelectedText('');
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {onBack && !isFullscreen && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Video Container */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
        />

        {/* Loading Indicator */}
        {!isPlayerReady && (
          <View style={styles.centerOverlay}>
            <ActivityIndicator size="large" color="#FFB6D9" />
            <Text style={styles.loadingText}>Loading video...</Text>
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
        {showSubtitles && currentSubtitle && (
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
                onPressIn={() => setIsSeeking(true)}
                onPressOut={() => setIsSeeking(false)}
              >
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(currentTime / duration) * 100}%`,
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
                  <Text style={styles.skipText}>-10s</Text>
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
                  <Text style={styles.skipText}>+10s</Text>
                </TouchableOpacity>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

                {/* Subtitle Toggle */}
                <TouchableOpacity
                  onPress={() => setShowSubtitles(!showSubtitles)}
                  style={styles.iconButton}
                >
                  <Text style={styles.ccText}>CC</Text>
                </TouchableOpacity>

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

              {/* Subtitle Offset Buttons */}
              {subtitles.length > 0 && (
                <View style={styles.offsetButtonsContainer}>
                  <TouchableOpacity
                    onPress={() => adjustSubtitleOffset(-1)}
                    style={styles.offsetButton}
                  >
                    <Text style={styles.offsetButtonText}>-0.5s</Text>
                  </TouchableOpacity>
                  <Text style={styles.offsetText}>Offset: {subtitleOffset.toFixed(1)}s</Text>
                  <TouchableOpacity
                    onPress={() => adjustSubtitleOffset(1)}
                    style={styles.offsetButton}
                  >
                    <Text style={styles.offsetButtonText}>+0.5s</Text>
                  </TouchableOpacity>
                </View>
              )}
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    bottom: 110,
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
  progressContainer: {
    marginBottom: 12,
    height: 28,
    justifyContent: 'center',
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
  skipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  timeDisplay: {
    color: '#fff',
    fontSize: 12,
    minWidth: 100,
    marginLeft: 4,
    fontVariant: ['tabular-nums'],
  },
  ccText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offsetButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  offsetButton: {
    backgroundColor: 'rgba(255, 182, 217, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  offsetButtonText: {
    color: '#FFB6D9',
    fontSize: 11,
    fontWeight: '600',
  },
  offsetText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
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
  sectionSection: {
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
