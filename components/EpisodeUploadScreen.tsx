import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Ionicons } from '@expo/vector-icons';
import { formatFileSize } from '@/utils/fileSystem';

interface UploadFile {
  uri: string;
  name: string;
  size: number;
}

interface EpisodeUploadScreenProps {
  onUpload: (videoUri: string, subtitleUri: string | null, title: string) => Promise<void>;
  isLoading?: boolean;
}

export const EpisodeUploadScreen: React.FC<EpisodeUploadScreenProps> = ({
  onUpload,
  isLoading = false,
}) => {
  const [videoFile, setVideoFile] = useState<UploadFile | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<UploadFile | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const pickVideoFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/mp4', 'video/x-matroska', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (file.size && file.size > 2 * 1024 * 1024 * 1024) {
        Alert.alert('File too large', 'Video files must be under 2GB');
        return;
      }

      setVideoFile({
        uri: file.uri,
        name: file.name,
        size: file.size || 0,
      });

      // Auto-generate title from filename
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setEpisodeTitle(nameWithoutExtension);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video file');
    }
  };

  const pickSubtitleFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      // Validate file extension
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.srt') && !fileName.endsWith('.vtt') && !fileName.endsWith('.ass')) {
        Alert.alert('Invalid Format', 'Please select a .srt, .vtt, or .ass subtitle file');
        return;
      }

      setSubtitleFile({
        uri: file.uri,
        name: file.name,
        size: file.size || 0,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick subtitle file');
    }
  };

  const handleUpload = async () => {
    if (!videoFile) {
      Alert.alert('Missing', 'Please select a video file');
      return;
    }

    if (!episodeTitle.trim()) {
      Alert.alert('Missing', 'Please enter an episode title');
      return;
    }

    try {
      setShowPreview(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      await onUpload(videoFile.uri, subtitleFile?.uri || null, episodeTitle);

      clearInterval(interval);
      setUploadProgress(100);

      // Reset form
      setTimeout(() => {
        setVideoFile(null);
        setSubtitleFile(null);
        setEpisodeTitle('');
        setUploadProgress(0);
        setShowPreview(false);
      }, 1500);
    } catch (error) {
      Alert.alert('Upload Error', 'Failed to upload episode');
      setShowPreview(false);
      setUploadProgress(0);
    }
  };

  const clearVideoFile = () => {
    setVideoFile(null);
    setEpisodeTitle('');
  };

  const clearSubtitleFile = () => {
    setSubtitleFile(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Upload Episode</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Add an anime episode to start learning
          </ThemedText>
        </View>

        {/* Video Upload Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            <Ionicons name="film" size={16} /> Video File
          </ThemedText>

          {videoFile ? (
            <View style={styles.fileCard}>
              <View style={styles.fileInfo}>
                <Ionicons name="videocam" size={24} color="#B19CD9" />
                <View style={styles.fileDetails}>
                  <ThemedText style={styles.fileName} numberOfLines={1}>
                    {videoFile.name}
                  </ThemedText>
                  <ThemedText style={styles.fileSize}>
                    {formatFileSize(videoFile.size)}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity onPress={clearVideoFile} style={styles.removeButton}>
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickVideoFile}>
              <Ionicons name="cloud-upload" size={32} color="#B19CD9" />
              <ThemedText style={styles.uploadButtonText}>
                Tap to select video file
              </ThemedText>
              <ThemedText style={styles.uploadButtonHint}>
                MP4, MKV, or other video formats
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Episode Title */}
        {videoFile && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Episode Title</ThemedText>
            <View style={styles.inputContainer}>
              <Text
                style={styles.input}
                onChangeText={setEpisodeTitle}
                value={episodeTitle}
                placeholder="Enter episode title"
              />
            </View>
          </View>
        )}

        {/* Subtitle Upload Section */}
        {videoFile && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              <Ionicons name="text" size={16} /> Subtitles (Optional)
            </ThemedText>

            {subtitleFile ? (
              <View style={styles.fileCard}>
                <View style={styles.fileInfo}>
                  <Ionicons name="document-text" size={24} color="#7FE5DE" />
                  <View style={styles.fileDetails}>
                    <ThemedText style={styles.fileName} numberOfLines={1}>
                      {subtitleFile.name}
                    </ThemedText>
                    <ThemedText style={styles.fileSize}>
                      {formatFileSize(subtitleFile.size)}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity onPress={clearSubtitleFile} style={styles.removeButton}>
                  <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickSubtitleFile}>
                <Ionicons name="cloud-upload" size={32} color="#7FE5DE" />
                <ThemedText style={styles.uploadButtonText}>
                  Tap to select subtitle file
                </ThemedText>
                <ThemedText style={styles.uploadButtonHint}>
                  SRT, VTT, or ASS subtitle formats
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Upload Button */}
        {videoFile && (
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleUpload}
            disabled={isLoading}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <ThemedText style={styles.submitButtonText}>
              {isLoading ? 'Uploading...' : 'Upload Episode'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Upload Progress Modal */}
      <Modal visible={showPreview} transparent animationType="fade">
        <View style={styles.progressModal}>
          <View style={styles.progressCard}>
            <ActivityIndicator size="large" color="#B19CD9" />
            <ThemedText style={styles.progressTitle}>Uploading Episode</ThemedText>
            <ThemedText style={styles.progressSubtitle}>{episodeTitle}</ThemedText>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${uploadProgress}%` },
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {Math.round(uploadProgress)}%
            </ThemedText>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#B19CD9',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0FF',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  uploadButtonHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F0FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0D4FF',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E0D4FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F0FF',
  },
  input: {
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#B19CD9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: '#FFFACD',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0D4FF',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B19CD9',
  },
  progressText: {
    fontSize: 12,
    color: '#999',
  },
});
