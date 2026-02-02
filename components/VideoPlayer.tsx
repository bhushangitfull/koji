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
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Subtitle, getSubtitleAtTime } from '@/utils/subtitleParser';

const { width } = Dimensions.get('window');

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
    console.log('VideoPlayer initialized with URI:', videoUri);
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [showWordModal, setShowWordModal] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play when player is ready
  useEffect(() => {
    if (isPlayerReady && !isPlaying) {
      console.log('Auto-playing video');
      player.play().catch((err) => {
        console.error('Error playing video:', err);
        setPlayerError('Failed to play video: ' + (err instanceof Error ? err.message : 'Unknown error'));
      });
      setIsPlaying(true);
    }
  }, [isPlayerReady, player, isPlaying]);

  // Reset player state when videoUri changes
  useEffect(() => {
    setIsPlayerReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayerError(null);
    console.log('VideoUri changed, resetting player state');
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
    }, 3000);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
    showControls();
  };

  const handleWordPress = (word: string) => {
    // In a real app, you'd look this up in your dictionary
    setSelectedWord({
      word,
      hiragana: 'ひらがな', // Placeholder
      english: 'Translation of word',
    });
    setShowWordModal(true);
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

  const handleSeek = (newTime: number) => {
    player.currentTime = newTime;
    setCurrentTime(newTime);
    showControls();
  };

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
          onStatusUpdate={(status) => {
            if (!isPlayerReady && status.isReady) {
              setIsPlayerReady(true);
              console.log('Video player is ready');
            }
            setCurrentTime(status.currentTime);
            setDuration(status.duration);
            setIsPlaying(status.isPlaying);
          }}
        />

        {/* Loading indicator */}
        {!isPlayerReady && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFB6D9" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {/* Error display */}
        {playerError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{playerError}</Text>
          </View>
        )}
        {controlsVisible && (
          <View style={styles.controlsOverlay}>
            {/* Title */}
            {title && <ThemedText style={styles.title}>{title}</ThemedText>}

            {/* Subtitle Display */}
            {currentSubtitle && (
              <TouchableOpacity
                style={styles.subtitleArea}
                onPress={() => showControls()}
                activeOpacity={0.7}
              >
                <Text style={styles.subtitleText}>{currentSubtitle.text}</Text>
              </TouchableOpacity>
            )}

            {/* Playback Controls */}
            <View style={styles.controls}>
              <TouchableOpacity onPress={togglePlayPause}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${(currentTime / duration) * 100}%`,
                    },
                  ]}
                />
              </View>

              {/* Time Display */}
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </View>
          </View>
        )}

        {/* Tap to show controls */}
        <TouchableOpacity
          style={styles.tapArea}
          onPress={showControls}
          activeOpacity={0.1}
        />
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
              <ThemedText style={styles.modalTitle}>Word Lookup</ThemedText>
              <TouchableOpacity onPress={() => setShowWordModal(false)}>
                <Ionicons name="close" size={24} color="#B19CD9" />
              </TouchableOpacity>
            </View>

            {selectedWord && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.wordSection}>
                  <ThemedText style={styles.wordText}>{selectedWord.word}</ThemedText>
                  <ThemedText style={styles.hiraganaText}>{selectedWord.hiragana}</ThemedText>
                  <ThemedText style={styles.englishText}>{selectedWord.english}</ThemedText>
                </View>

                <View style={styles.exampleSection}>
                  <ThemedText style={styles.sectionTitle}>Example Sentences</ThemedText>
                  {/* Placeholder - would load from dictionary API */}
                  <ThemedText style={styles.placeholder}>Examples would appear here</ThemedText>
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
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitleArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  subtitleText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  controls: {
    gap: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFB6D9',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  hiraganaText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  englishText: {
    fontSize: 16,
    color: '#B19CD9',
    fontWeight: '500',
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
