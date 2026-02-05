import { RetroButton } from '@/components/ui/retro-button';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'N5':
      return 'seedling';
    case 'N4':
      return 'sprout';
    case 'N3':
      return 'run-fast';
    case 'N2':
      return 'star-outline';
    case 'N1':
      return 'star';
    default:
      return 'help-circle';
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'N5':
      return '#A8E6CF';
    case 'N4':
      return '#7FE5DE';
    case 'N3':
      return '#FFB6D9';
    case 'N2':
      return '#FFD700';
    case 'N1':
      return '#9B59B6';
    default:
      return '#CCCCCC';
  }
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signOut, user } = useAuth();
  const { profile, loading } = useUserProfile();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/sign-in');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push('/user-setup');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={colors.primary} />
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to load profile</Text>
          <RetroButton variant="primary" onPress={() => router.replace('/user-setup')}>
            Complete Setup
          </RetroButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#000000' }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: '#333333' }]}>Your learning journey</Text>
        </View>

        {/* Player Card */}
        <RetroWindow color="blue" style={styles.playerCard}>
          <View style={styles.playerHeader}>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                ]}
              >
                <Feather name="user" size={48} color={colors.primary} />
              </View>
              <View
                style={[
                  styles.levelBadge,
                  {
                    backgroundColor: getLevelColor(profile.jlpt_level),
                    borderColor: '#000',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={getLevelIcon(profile.jlpt_level)}
                  size={16}
                  color="#000"
                />
              </View>
            </View>
            <View style={styles.playerInfo}>
              <Text style={[styles.playerName, { color: '#333333' }]}>
                {profile.display_name}
              </Text>
              <View style={styles.levelContainer}>
                <Text style={[styles.levelText, { color: '#666666' }]}>
                  {profile.jlpt_level}
                </Text>
              </View>
              <Text style={[styles.emailText, { color: '#999999' }]}>{user?.email}</Text>
            </View>
            <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
              <Feather name="edit-2" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
          {profile.bio && (
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <MaterialCommunityIcons name="text" size={18} color="#666666" />
                <Text style={[styles.bioLabel, { color: '#666666' }]}>Bio</Text>
              </View>
              <Text style={[styles.bioText, { color: '#333333' }]}>{profile.bio}</Text>
            </View>
          )}
        </RetroWindow>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <RetroWindow color="peach" style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="fire" size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {profile.current_streak}
              </Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Day Streak</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="purple" style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="book-open-variant" size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {profile.total_words_learned}
              </Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Words</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="green" style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="television-play" size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {profile.total_episodes_watched}
              </Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Episodes</Text>
            </View>
          </RetroWindow>
        </View>

        {/* Account Info */}
        <RetroWindow title="Account Information" color="purple" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <Feather name="calendar" size={16} color="#666666" />
              <Text style={[styles.infoLabel, { color: '#666666' }]}>Member Since</Text>
            </View>
            <Text style={[styles.infoValue, { color: '#333333' }]}>
              {new Date(profile.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoRowLeft}>
              <MaterialCommunityIcons
                name={getLevelIcon(profile.jlpt_level)}
                size={16}
                color="#666666"
              />
              <Text style={[styles.infoLabel, { color: '#666666' }]}>JLPT Level</Text>
            </View>
            <Text style={[styles.infoValue, { color: '#333333' }]}>{profile.jlpt_level}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoRowLeft}>
              <Feather name="clock" size={16} color="#666666" />
              <Text style={[styles.infoLabel, { color: '#666666' }]}>Study Time</Text>
            </View>
            <Text style={[styles.infoValue, { color: '#333333' }]}>
              {Math.floor(profile.total_study_minutes / 60)}h {profile.total_study_minutes % 60}m
            </Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoRowLeft}>
              <MaterialCommunityIcons name="trophy" size={16} color="#666666" />
              <Text style={[styles.infoLabel, { color: '#666666' }]}>Longest Streak</Text>
            </View>
            <Text style={[styles.infoValue, { color: '#333333' }]}>
              {profile.longest_streak} days
            </Text>
          </View>
        </RetroWindow>

        {/* Learning Stats */}
        <RetroWindow title="Learning Progress" color="mint" style={styles.infoCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressLabel}>
              <MaterialCommunityIcons name="book" size={20} color={colors.primary} />
              <Text style={[styles.progressText, { color: '#333333' }]}>Words Learned</Text>
            </View>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {profile.total_words_learned}
            </Text>
          </View>
          
          <View style={[styles.progressRow, styles.infoRowBorder]}>
            <View style={styles.progressLabel}>
              <MaterialCommunityIcons name="format-quote-close" size={20} color={colors.primary} />
              <Text style={[styles.progressText, { color: '#333333' }]}>Phrases Learned</Text>
            </View>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {profile.total_phrases_learned}
            </Text>
          </View>

          <View style={[styles.progressRow, styles.infoRowBorder]}>
            <View style={styles.progressLabel}>
              <MaterialCommunityIcons name="play-circle" size={20} color={colors.primary} />
              <Text style={[styles.progressText, { color: '#333333' }]}>Episodes Watched</Text>
            </View>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {profile.total_episodes_watched}
            </Text>
          </View>
        </RetroWindow>

    

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: '#FFE5E5', borderColor: '#FF6B6B' }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#FF6B6B" />
          <Text style={[styles.logoutText, { color: '#FF6B6B' }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.mono,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: Fonts.mono,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Fonts.mono,
  },
  playerCard: {
    marginBottom: 24,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
  emailText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  bioSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  bioLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.mono,
    textTransform: 'uppercase',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.mono,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Fonts.mono,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.mono,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.mono,
    maxWidth: '50%',
    textAlign: 'right',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.mono,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  actionButtons: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
});