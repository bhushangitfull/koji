import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { RetroButton } from '@/components/ui/retro-button';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEpisodeUpload } from '@/hooks/useEpisodeUpload';
import { useCallback, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { initializeAppDirectories, formatFileSize } from '@/utils/fileSystem';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#A8E6CF';
    case 'processing':
      return '#FFD700';
    case 'pending':
      return '#FF9999';
    default:
      return '#CCCCCC';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return 'check-circle';
    case 'processing':
      return 'loader';
    case 'pending':
      return 'clock';
    default:
      return 'help-circle';
  }
};

export default function LibraryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { episodes, uploadEpisode, deleteEpisode, isLoading } = useEpisodeUpload();

  // Initialize app directories on mount
  useEffect(() => {
    initializeAppDirectories().catch((err) => {
      console.error('Failed to initialize directories:', err);
    });
  }, []);

  const handleUploadPress = useCallback(async () => {
    try {
      console.log('Opening video picker...');
      const videoResult = await DocumentPicker.getDocumentAsync({
        type: ['video/mp4', 'video/x-matroska', 'video/*'],
        copyToCacheDirectory: true,
      });

      console.log('Video result:', videoResult);

      if (videoResult.canceled) {
        console.log('User canceled video picker');
        return;
      }

      const videoFile = videoResult.assets[0];
      console.log('Selected video:', videoFile);
      
      if (videoFile.size && videoFile.size > 2 * 1024 * 1024 * 1024) {
        Alert.alert('File too large', 'Video files must be under 2GB');
        return;
      }

      let title = videoFile.name.replace(/\.[^/.]+$/, '');

      // Ask if user wants to add subtitles
      let subtitleUri: string | null = null;
      
      await new Promise((resolve) => {
        Alert.alert(
          'Add Subtitles?',
          'Would you like to add a subtitle file for this episode?',
          [
            {
              text: 'Skip',
              onPress: () => resolve(null),
              style: 'cancel',
            },
            {
              text: 'Add Subtitles',
              onPress: async () => {
                const subtitleResult = await DocumentPicker.getDocumentAsync({
                  type: ['text/plain', 'text/vtt', 'text/srt'],
                  copyToCacheDirectory: true,
                });

                if (!subtitleResult.canceled) {
                  subtitleUri = subtitleResult.assets[0].uri;
                }
                resolve(null);
              },
            },
          ]
        );
      });

      // Upload
      console.log('Starting upload with:', { videoUri: videoFile.uri, subtitleUri, title });
      await uploadEpisode(videoFile.uri, subtitleUri, title);
      Alert.alert('Success', 'Episode uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Upload Error', errorMessage);
    }
  }, [uploadEpisode]);

  const handleDelete = useCallback(
    (episodeId: string) => {
      Alert.alert('Delete Episode', 'Are you sure?', [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => {
            deleteEpisode(episodeId).catch((err) => {
              Alert.alert('Error', 'Failed to delete episode');
            });
          },
          style: 'destructive',
        },
      ]);
    },
    [deleteEpisode]
  );

  const renderEpisodeCard = ({ item }: { item: typeof episodes[0] }) => (
    <TouchableOpacity style={styles.episodeCard}>
      <View style={styles.episodeHeader}>
        <View style={styles.episodeTitleContainer}>
          <Text style={[styles.episodeTitle, { color: '#000000' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.episodeMetaBadges}>
            <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
              <Feather name="file-video" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {formatFileSize(item.size)}
              </Text>
            </View>
            {item.subtitles && (
              <View style={[styles.badge, { backgroundColor: '#7FE5DE' + '20' }]}>
                <Feather name="book" size={12} color="#7FE5DE" />
                <Text style={[styles.badgeText, { color: '#7FE5DE' }]}>
                  {item.subtitles.length} subtitles
                </Text>
              </View>
            )}
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.processingStatus) },
          ]}
        >
          <MaterialIcons
            name={getStatusIcon(item.processingStatus) as any}
            size={16}
            color="#000"
          />
        </View>
      </View>

      <View style={styles.episodeDetails}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color="#666666" />
          <Text style={[styles.detailText, { color: '#666666' }]}>
            {new Date(item.uploadedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.episodeActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.primary + '20' }]}
          onPress={() => {
            console.log('Playing episode:', item.id);
            router.push({
              pathname: '/player',
              params: { episodeId: item.id }
            });
          }}
        >
          <Feather name="play" size={16} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Watch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7FE5DE' + '20' }]}>
          <Feather name="book-open" size={16} color="#7FE5DE" />
          <Text style={[styles.actionBtnText, { color: '#7FE5DE' }]}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#FF9999' + '20' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Feather name="trash-2" size={16} color="#FF9999" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#000000' }]}>Library</Text>
          <Text style={[styles.subtitle, { color: '#666666' }]}>Manage your anime episodes</Text>
        </View>

        {/* Upload Section */}
        <RetroWindow title="Add New Episode" color="pink" style={styles.windowSection}>
          <View style={styles.uploadContainer}>
            <Feather name="upload-cloud" size={48} color={colors.primary} />
            <Text style={[styles.uploadText, { color: '#333333' }]}>
              Upload anime episode with subtitles
            </Text>
            <RetroButton
              variant="primary"
              size="medium"
              onPress={handleUploadPress}
              style={styles.uploadButton}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Select Files'}
            </RetroButton>
          </View>
        </RetroWindow>

        {/* Stats */}
        <RetroWindow title="Your Library Stats" color="purple" style={styles.windowSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Feather name="film" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>{episodes.length}</Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Episodes</Text>
            </View>
            <View style={styles.statBox}>
              <Feather name="check-circle" size={24} color="#A8E6CF" />
              <Text style={[styles.statNumber, { color: '#A8E6CF' }]}>
                {episodes.filter((e) => e.processingStatus === 'completed').length}
              </Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Processed</Text>
            </View>
            <View style={styles.statBox}>
              <Feather name="hard-drive" size={24} color="#FFD700" />
              <Text style={[styles.statNumber, { color: '#FFD700' }]}>
                {formatFileSize(episodes.reduce((sum, e) => sum + e.size, 0))}
              </Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Storage</Text>
            </View>
          </View>
        </RetroWindow>

        {/* Episodes List */}
        {episodes.length > 0 ? (
          <RetroWindow title="Your Episodes" color="pink" style={styles.windowSection}>
            <FlatList
              data={episodes}
              renderItem={renderEpisodeCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.episodesList}
            />
          </RetroWindow>
        ) : (
          <RetroWindow title="Your Episodes" color="pink" style={styles.windowSection}>
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color="#CCCCCC" />
              <Text style={[styles.emptyStateText, { color: '#666666' }]}>
                No episodes yet. Upload one to get started!
              </Text>
            </View>
          </RetroWindow>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  windowSection: {
    marginBottom: 16,
  },
  /* Upload Styles */
  uploadContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 12,
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
  uploadButton: {
    marginTop: 12,
  },
  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: Fonts.rounded,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: Fonts.sans,
  },
  /* Episodes List */
  episodesList: {
    gap: 12,
  },
  episodeCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 4,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  episodeTitleContainer: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: Fonts.sans,
  },
  episodeMetaBadges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  episodeDetails: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 10,
    fontFamily: Fonts.sans,
  },
  episodeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    marginTop: 12,
    textAlign: 'center',
  },
});
