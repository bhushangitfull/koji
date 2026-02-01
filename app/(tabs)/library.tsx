import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { RetroButton } from '@/components/ui/retro-button';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock data for episodes
const EPISODES = [
  {
    id: 1,
    title: 'Attack on Titan - Episode 1',
    duration: '24:15',
    wordCount: 342,
    lastWatched: '2 days ago',
    processingStatus: 'completed',
    progress: 65,
  },
  {
    id: 2,
    title: 'Demon Slayer - Episode 5',
    duration: '24:30',
    wordCount: 289,
    lastWatched: '5 days ago',
    processingStatus: 'completed',
    progress: 40,
  },
  {
    id: 3,
    title: 'Death Note - Episode 2',
    duration: '23:45',
    wordCount: 451,
    lastWatched: 'never',
    processingStatus: 'processing',
    progress: 0,
  },
  {
    id: 4,
    title: 'My Hero Academia - Episode 10',
    duration: '25:00',
    wordCount: 0,
    lastWatched: 'never',
    processingStatus: 'pending',
    progress: 0,
  },
];

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderEpisodeCard = ({ item }: { item: typeof EPISODES[0] }) => (
    <TouchableOpacity style={styles.episodeCard}>
      <View style={styles.episodeHeader}>
        <View style={styles.episodeTitleContainer}>
          <Text style={[styles.episodeTitle, { color: '#000000' }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.episodeMetaBadges}>
            <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
              <Feather name="clock" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>{item.duration}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#7FE5DE' + '20' }]}>
              <Feather name="book" size={12} color="#7FE5DE" />
              <Text style={[styles.badgeText, { color: '#7FE5DE' }]}>{item.wordCount} words</Text>
            </View>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.processingStatus) },
          ]}
        >
          <MaterialIcons name={getStatusIcon(item.processingStatus) as any} size={16} color="#000" />
        </View>
      </View>

      <View style={styles.episodeDetails}>
        <View style={styles.detailRow}>
          <Feather name="play-circle" size={14} color="#666666" />
          <Text style={[styles.detailText, { color: '#666666' }]}>
            Last watched: {item.lastWatched}
          </Text>
        </View>

        {item.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.progress}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: '#666666' }]}>
              {item.progress}% watched
            </Text>
          </View>
        )}
      </View>

      <View style={styles.episodeActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + '20' }]}>
          <Feather name="play" size={16} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Watch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7FE5DE' + '20' }]}>
          <Feather name="book-open" size={16} color="#7FE5DE" />
          <Text style={[styles.actionBtnText, { color: '#7FE5DE' }]}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF9999' + '20' }]}>
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
              onPress={() => {}}
              style={styles.uploadButton}
            >
              Select Files
            </RetroButton>
          </View>
        </RetroWindow>

        {/* Stats */}
        <RetroWindow title="Your Library Stats" color="purple" style={styles.windowSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Feather name="film" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.primary }]}>4</Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Episodes</Text>
            </View>
            <View style={styles.statBox}>
              <Feather name="check-circle" size={24} color="#A8E6CF" />
              <Text style={[styles.statNumber, { color: '#A8E6CF' }]}>2</Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Processed</Text>
            </View>
            <View style={styles.statBox}>
              <Feather name="loader" size={24} color="#FFD700" />
              <Text style={[styles.statNumber, { color: '#FFD700' }]}>1</Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Processing</Text>
            </View>
          </View>
        </RetroWindow>

        {/* Episodes List */}
        <RetroWindow title="Your Episodes" color="pink" style={styles.windowSection}>
          <FlatList
            data={EPISODES}
            renderItem={renderEpisodeCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.episodesList}
          />
        </RetroWindow>
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
});
