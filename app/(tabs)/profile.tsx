import { RetroButton } from '@/components/ui/retro-button';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// This would come from Supabase in production
const profileData = {
  playerName: 'KojiLearner',
  email: 'user@example.com',
  level: 'Intermediate',
  bio: 'Learning Japanese through anime! Currently watching Attack on Titan and Demon Slayer. Goal: Pass JLPT N3 this year!',
  totalPoints: 4250,
  joinedDate: 'Jan 15, 2024',
  streak: 12,
  totalEpisodes: 28,
  achievements: [
    { id: 1, title: '7-Day Streak', description: 'Study 7 days in a row', unlocked: true },
    { id: 2, title: 'Word Master', description: 'Learn 500 words', unlocked: true },
    { id: 3, title: 'Episode Binge', description: 'Watch 10 episodes', unlocked: false },
    { id: 4, title: 'Quiz Champion', description: 'Score 100% on 5 quizzes', unlocked: false },
  ],
};

const getLevelIcon = (level: string) => {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'seedling';
    case 'intermediate':
      return 'run-fast';
    case 'advanced':
      return 'star';
    default:
      return 'help-circle';
  }
};

const getLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'beginner':
      return '#A8E6CF';
    case 'intermediate':
      return '#FFB6D9';
    case 'advanced':
      return '#FFD700';
    default:
      return '#CCCCCC';
  }
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signOut } = useAuth();
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
    // Navigate to user setup screen for editing
    router.push('/user-setup');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#000000' }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: '#333333' }]}>Your learning profile</Text>
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
                    backgroundColor: getLevelColor(profileData.level),
                    borderColor: '#000',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={getLevelIcon(profileData.level)}
                  size={16}
                  color="#000"
                />
              </View>
            </View>
            <View style={styles.playerInfo}>
              <Text style={[styles.playerName, { color: '#333333' }]}>
                {profileData.playerName}
              </Text>
              <View style={styles.levelContainer}>
                <Text style={[styles.levelText, { color: '#666666' }]}>
                  {profileData.level} Level
                </Text>
              </View>
              <Text style={[styles.emailText, { color: '#999999' }]}>{profileData.email}</Text>
            </View>
            <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
              <Feather name="edit-2" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Bio Section */}
          {profileData.bio && (
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <MaterialCommunityIcons name="text" size={18} color="#666666" />
                <Text style={[styles.bioLabel, { color: '#666666' }]}>Bio</Text>
              </View>
              <Text style={[styles.bioText, { color: '#333333' }]}>{profileData.bio}</Text>
            </View>
          )}
        </RetroWindow>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <RetroWindow color="peach" style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="fire" size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {profileData.streak}
              </Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Day Streak</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="purple" style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="star" size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {profileData.totalPoints}
              </Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Points</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="green" style={styles.statCard}>
            <View style={styles.statContent}>
              <MaterialCommunityIcons name="television-play" size={28} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {profileData.totalEpisodes}
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
            <Text style={[styles.infoValue, { color: '#333333' }]}>{profileData.joinedDate}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoRowLeft}>
              <MaterialCommunityIcons
                name={getLevelIcon(profileData.level)}
                size={16}
                color="#666666"
              />
              <Text style={[styles.infoLabel, { color: '#666666' }]}>Current Level</Text>
            </View>
            <Text style={[styles.infoValue, { color: '#333333' }]}>{profileData.level}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoRowLeft}>
              <Feather name="mail" size={16} color="#666666" />
              <Text style={[styles.infoLabel, { color: '#666666' }]}>Email</Text>
            </View>
            <Text style={[styles.infoValue, { color: '#333333' }]} numberOfLines={1}>
              {profileData.email}
            </Text>
          </View>
        </RetroWindow>

        {/* Achievements */}
        <View style={styles.achievementSection}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>Achievements</Text>
          {profileData.achievements.map((achievement) => (
            <RetroWindow key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementRow}>
                <View
                  style={[
                    styles.achievementBadge,
                    {
                      backgroundColor: achievement.unlocked
                        ? colors.primary + '20'
                        : colors.textSecondary + '15',
                      borderColor: achievement.unlocked ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  <Feather
                    name={achievement.unlocked ? 'award' : 'lock'}
                    size={20}
                    color={achievement.unlocked ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, { color: '#333333' }]}>
                    {achievement.title}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: '#666666' }]}>
                    {achievement.description}
                  </Text>
                </View>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Text style={[styles.unlockedText, { color: colors.primary }]}>✓</Text>
                  </View>
                )}
              </View>
            </RetroWindow>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <RetroButton
            variant="outline"
            size="medium"
            onPress={handleEditProfile}
            style={styles.actionButton}
          >
            Edit Profile
          </RetroButton>

          <RetroButton variant="outline" size="medium" onPress={() => {}} style={styles.actionButton}>
            Settings
          </RetroButton>
        </View>

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

  // Player Card
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

  // Bio Section
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

  // Stats Grid
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

  // Info Card
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

  // Achievements
  achievementSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 12,
  },
  achievementCard: {
    marginBottom: 12,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: Fonts.mono,
  },
  unlockedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },

  // Logout Button
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