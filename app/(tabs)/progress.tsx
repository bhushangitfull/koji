import { ThemedText } from '@/components/themed-text';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock user data
const mockUserStats = {
  streak: 12,
  wordsLearned: 342,
  phrasesLearned: 87,
  minutesToday: 15,
  totalMinutesThisMonth: 485,
  totalEpisodesCompleted: 28,
  currentLevel: 'Intermediate',
  thisWeekEpisodes: 5,
};

// Mock weekly data for chart
const weeklyData = [
  { day: 'Mon', minutes: 25 },
  { day: 'Tue', minutes: 30 },
  { day: 'Wed', minutes: 0 },
  { day: 'Thu', minutes: 45 },
  { day: 'Fri', minutes: 20 },
  { day: 'Sat', minutes: 35 },
  { day: 'Sun', minutes: 15 },
];

// Mock leaderboard data
const leaderboardData = [
  { rank: 1, name: 'Alex Chen', wordsLearned: 892, streak: 45, badge: '' },
  { rank: 2, name: 'Jordan Smith', wordsLearned: 756, streak: 32, badge: '' },
  { rank: 3, name: 'You', wordsLearned: 342, streak: 12, badge: '' },
  { rank: 4, name: 'Taylor Brown', wordsLearned: 298, streak: 8, badge: '' },
  { rank: 5, name: 'Morgan Lee', wordsLearned: 245, streak: 5, badge: '' },
];

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 50);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: '#000000' }]}>Your Progress</ThemedText>
          <ThemedText style={[styles.subtitle, { color: '#333333' }]}>Keep learning, keep growing</ThemedText>
        </View>

        {/* Learning Stats Grid */}
        <View style={styles.statsGrid}>
          <RetroWindow color="blue" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{mockUserStats.wordsLearned}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Words</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="purple" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{mockUserStats.phrasesLearned}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Phrases</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="mint" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{mockUserStats.totalEpisodesCompleted}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Episodes</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="indigo" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{mockUserStats.totalMinutesThisMonth}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Minutes</Text>
            </View>
          </RetroWindow>
        </View>

        {/* Today's Activity */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>Today's Activity</Text>
          <RetroWindow color="pink">
            <View style={styles.activityRow}>
              <Text style={[styles.activityLabel, { color: '#333333' }]}>Minutes studied</Text>
              <Text style={[styles.activityValue, { color: colors.primary }]}>{mockUserStats.minutesToday} min</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.accent + '40' }]}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${(mockUserStats.minutesToday / 60) * 100}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            <Text style={[styles.goalText, { color: '#666666' }]}>Goal: 30 minutes</Text>
          </RetroWindow>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>This Week</Text>
          <RetroWindow title="Weekly Progress" color="blue">
            <View style={styles.chartContainer}>
              {weeklyData.map((day, index) => (
                <View key={index} style={styles.chartBarWrapper}>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height: day.minutes > 0 ? (day.minutes / maxMinutes) * 100 : 8,
                          backgroundColor: day.minutes === 0 ? '#e0e0e0' : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.chartLabel, { color: '#333333' }]}>{day.day}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.chartStats, { color: '#666666' }]}>
              You studied <Text style={[styles.chartStatsBold, { color: '#333333' }]}>{mockUserStats.thisWeekEpisodes} episodes</Text> this week
            </Text>
          </RetroWindow>
        </View>

        {/* Monthly Stats */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>February Progress</Text>
          <RetroWindow title="Monthly Stats" color="purple">
            <View style={styles.monthlyRow}>
              <Text style={[styles.monthlyLabel, { color: '#333333' }]}>Total minutes</Text>
              <Text style={[styles.monthlyValue, { color: colors.primary }]}>{mockUserStats.totalMinutesThisMonth}</Text>
            </View>
            <View style={styles.monthlyRow}>
              <Text style={[styles.monthlyLabel, { color: '#333333' }]}>Words learned</Text>
              <Text style={[styles.monthlyValue, { color: colors.primary }]}>{mockUserStats.wordsLearned}</Text>
            </View>
            <View style={styles.monthlyRow}>
              <Text style={[styles.monthlyLabel, { color: '#333333' }]}>Level</Text>
              <Text style={[styles.monthlyValue, { color: colors.primary }]}>{mockUserStats.currentLevel}</Text>
            </View>
          </RetroWindow>
        </View>

        {/* Leaderboard */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>Leaderboard</Text>
          <Text style={[styles.leaderboardSubtext, { color: '#666666' }]}>Words learned this month</Text>

          <RetroWindow title="Top Players" color="mint">
            {leaderboardData.map((user) => (
              <View 
                key={user.rank} 
                style={[
                  styles.leaderboardRow,
                  user.rank === 3 && [styles.leaderboardRowHighlight, { backgroundColor: colors.primary + '15' }]
                ]}
              >
                <View style={[styles.rankMedal, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.rankNumber, { color: colors.primary }]}>
                    {user.rank}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: '#333333' }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.userStats, { color: '#666666' }]}>
                    {user.wordsLearned} words • {user.streak}d streak
                  </Text>
                </View>

                <View style={[styles.userBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {user.wordsLearned}
                  </Text>
                </View>
              </View>
            ))}
          </RetroWindow>
        </View>

        {/* Motivation Banner */}
        <RetroWindow color="indigo" style={styles.banner}>
          <Text style={[styles.bannerText, { color: '#333333' }]}>
            Complete one more episode today and maintain your streak!
          </Text>
        </RetroWindow>

        <View style={{ height: 20 }} />
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
    opacity: 0.6,
    fontWeight: '500',
    fontFamily: Fonts.mono,
  },

  // Streak Card
  streakCard: {
    marginBottom: 24,
  },
  streakContent: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.mono,
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: Fonts.mono,
    marginBottom: 4,
  },
  streakSubtext: {
    fontSize: 12,
  },
  streakBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    color: '#fff',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
  },
  statCardContent: {
    alignItems: 'center',
    padding: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Fonts.mono,
    textAlign: 'center',
  },

  // Section Container
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.mono,
    marginBottom: 12,
  },

  // Today's Activity
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.mono,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  goalText: {
    fontSize: 12,
  },

  // Chart
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: 16,
  },
  chartBarWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    width: '80%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.mono,
  },
  chartStats: {
    fontSize: 13,
    textAlign: 'center',
  },
  chartStatsBold: {
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },

  // Monthly Stats
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  monthlyLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.mono,
  },
  monthlyValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },

  // Leaderboard
  leaderboardSubtext: {
    fontSize: 13,
    marginBottom: 12,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  leaderboardRowHighlight: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  rankMedal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.mono,
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
  },
  userBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.mono,
  },

  // Banner
  banner: {
    marginTop: 8,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Fonts.mono,
    lineHeight: 20,
  },
});
