import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const profileData = {
  name: 'User',
  level: 'Intermediate',
  totalPoints: 4250,
  joinedDate: 'Jan 15, 2024',
  achievements: [
    { id: 1, title: '7-Day Streak', description: 'Study 7 days in a row', unlocked: true },
    { id: 2, title: 'Word Master', description: 'Learn 500 words', unlocked: true },
    { id: 3, title: 'Episode Binge', description: 'Watch 10 episodes', unlocked: false },
    { id: 4, title: 'Quiz Champion', description: 'Score 100% on 5 quizzes', unlocked: false },
  ],
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signOut } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  Alert.alert(
    'Sign Out',
    'Are you sure you want to sign out?',
    [
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
            router.replace('/(onboarding)/walkthrough');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]
  );
};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#000000' }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: '#333333' }]}>Your learning profile</Text>
        </View>

        {/* Avatar Section */}
        <RetroWindow color="blue" style={styles.avatarCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
              <Feather name="user" size={48} color={colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: '#333333' }]}>{profileData.name}</Text>
              <Text style={[styles.userLevel, { color: '#666666' }]}>{profileData.level}</Text>
            </View>
          </View>
        </RetroWindow>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <RetroWindow color="peach" style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{profileData.totalPoints}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Points</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="green" style={styles.statCard}>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>28</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Episodes</Text>
            </View>
          </RetroWindow>
        </View>

        {/* Account Info */}
        <RetroWindow title="Account Information" color="purple" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: '#666666' }]}>Member Since</Text>
            <Text style={[styles.infoValue, { color: '#333333' }]}>{profileData.joinedDate}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <Text style={[styles.infoLabel, { color: '#666666' }]}>Current Level</Text>
            <Text style={[styles.infoValue, { color: '#333333' }]}>{profileData.level}</Text>
          </View>
        </RetroWindow>

        {/* Achievements */}
        <View style={styles.achievementSection}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>Achievements</Text>
          {profileData.achievements.map((achievement) => (
            <RetroWindow key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementRow}>
                <View style={[styles.achievementBadge, { 
                  backgroundColor: achievement.unlocked ? colors.primary + '20' : colors.textSecondary + '15',
                  borderColor: achievement.unlocked ? colors.primary : colors.textSecondary
                }]}>
                  <Feather 
                    name={achievement.unlocked ? 'award' : 'lock'} 
                    size={20} 
                    color={achievement.unlocked ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, { color: '#333333' }]}>{achievement.title}</Text>
                  <Text style={[styles.achievementDesc, { color: '#666666' }]}>{achievement.description}</Text>
                </View>
              </View>
            </RetroWindow>
          ))}
        </View>

        {/* Settings Button */}
        <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
          <Feather name="settings" size={20} color={colors.primary} />
          <Text style={[styles.settingsBtnText, { color: colors.primary }]}>Settings</Text>
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

  // Avatar Section
  avatarCard: {
    marginBottom: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    fontWeight: '500',
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
    minHeight: 100,
  },
  statContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.mono,
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

  // Settings Button
  settingsBtn: {
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
  settingsBtnText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
});
