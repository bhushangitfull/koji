import { ThemedText } from '@/components/themed-text';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLeaderboard, useUserStats, useWeeklyActivity } from '@/hooks/useSupabaseData';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Fetch data from Supabase
  const { stats: userStats, loading: statsLoading, error: statsError } = useUserStats();
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard();
  const { weeklyData, loading: weeklyLoading } = useWeeklyActivity();
  
  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Show loading only on initial load
  if (statsLoading && !userStats) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Use stats data or default values
  const displayStats = userStats || {
    streak: 0,
    wordsLearned: 0,
    phrasesLearned: 0,
    minutesToday: 0,
    totalMinutesThisMonth: 0,
    totalEpisodesCompleted: 0,
    currentLevel: 'Beginner',
    thisWeekEpisodes: 0,
    totalPoints: 0,
  };

  // Use leaderboard data or show empty state
  const hasLeaderboardData = leaderboard.length > 0;

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 50);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: '#000000' }]}>Your Progress</ThemedText>
          <ThemedText style={[styles.subtitle, { color: '#333333' }]}>Keep learning, keep growing</ThemedText>
        </View>

        {/* Show info banner if database is empty */}
        {displayStats.totalPoints === 0 && !statsError && (
          <RetroWindow color="blue" style={styles.infoBanner}>
            <Text style={[styles.infoBannerText, { color: '#333333' }]}>
              👋 Welcome to Koji! Start learning to see your stats here.
            </Text>
          </RetroWindow>
        )}

        {/* Learning Stats Grid */}
        <View style={styles.statsGrid}>
          <RetroWindow color="blue" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{displayStats.wordsLearned}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Words</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="purple" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{displayStats.phrasesLearned}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Phrases</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="mint" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{displayStats.totalEpisodesCompleted}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Episodes</Text>
            </View>
          </RetroWindow>

          <RetroWindow color="indigo" style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{displayStats.totalMinutesThisMonth}</Text>
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
              <Text style={[styles.activityValue, { color: colors.primary }]}>{displayStats.minutesToday} min</Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.accent + '40' }]}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min((displayStats.minutesToday / 30) * 100, 100)}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            <Text style={[styles.goalText, { color: '#666666' }]}>Goal: 30 minutes</Text>
          </RetroWindow>
        </View>

        {/* Today's Stats */}
        <RetroWindow
          title="Today's Stats"
          color="purple"
          style={styles.windowSection}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{displayStats.minutesToday}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Minutes</Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Studied</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{displayStats.streak}</Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Day</Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Streak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {displayStats.totalPoints > 0 ? Math.min(Math.round((displayStats.totalPoints / 5000) * 100), 100) : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: '#333333' }]}>Progress</Text>
              <Text style={[styles.statLabel, { color: '#666666' }]}>Overall</Text>
            </View>
          </View>
        </RetroWindow>

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
              You studied <Text style={[styles.chartStatsBold, { color: '#333333' }]}>{displayStats.thisWeekEpisodes} episodes</Text> this week
            </Text>
          </RetroWindow>
        </View>

        {/* Monthly Stats */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>February Progress</Text>
          <RetroWindow title="Monthly Stats" color="purple">
            <View style={styles.monthlyRow}>
              <Text style={[styles.monthlyLabel, { color: '#333333' }]}>Total minutes</Text>
              <Text style={[styles.monthlyValue, { color: colors.primary }]}>{displayStats.totalMinutesThisMonth}</Text>
            </View>
            <View style={styles.monthlyRow}>
              <Text style={[styles.monthlyLabel, { color: '#333333' }]}>Words learned</Text>
              <Text style={[styles.monthlyValue, { color: colors.primary }]}>{displayStats.wordsLearned}</Text>
            </View>
            <View style={styles.monthlyRow}>
              <Text style={[styles.monthlyLabel, { color: '#333333' }]}>Level</Text>
              <Text style={[styles.monthlyValue, { color: colors.primary }]}>{displayStats.currentLevel}</Text>
            </View>
          </RetroWindow>
        </View>

        {/* Leaderboard */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: '#000000' }]}>Leaderboard</Text>
          <Text style={[styles.leaderboardSubtext, { color: '#666666' }]}>Words learned this week</Text>

          <RetroWindow title="Top Players" color="mint">
            {leaderboardLoading ? (
              <View style={styles.loadingContainerSmall}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : !hasLeaderboardData ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: '#666666' }]}>
                  🏆 No leaderboard data yet
                </Text>
                <Text style={[styles.emptyStateSubtext, { color: '#999999' }]}>
                  Start learning to climb the ranks!
                </Text>
              </View>
            ) : (
              leaderboard.map((user) => (
                <View 
                  key={user.rank} 
                  style={[
                    styles.leaderboardRow,
                    user.name === 'You' && [styles.leaderboardRowHighlight, { backgroundColor: colors.primary + '15' }]
                  ]}
                >
                  <View style={[styles.rankMedal, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.rankNumber, { color: colors.primary }]}>
                      {user.badge || user.rank}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: '#333333' }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.userStats, { color: '#666666' }]}>
                      {user.wordsLearned} words
                    </Text>
                  </View>

                  <View style={[styles.userBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>
                      {user.wordsLearned}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </RetroWindow>
        </View>

        {/* Motivation Banner */}
        {displayStats.streak > 0 && (
          <RetroWindow color="indigo" style={styles.banner}>
            <Text style={[styles.bannerText, { color: '#333333' }]}>
              🔥 {displayStats.streak} day streak! Complete one more episode today to keep it going!
            </Text>
          </RetroWindow>
        )}

        {displayStats.totalPoints === 0 && (
          <RetroWindow color="indigo" style={styles.banner}>
            <Text style={[styles.bannerText, { color: '#333333' }]}>
              🚀 Ready to start your learning journey? Explore episodes to begin!
            </Text>
          </RetroWindow>
        )}

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
  infoBanner: {
    marginBottom: 20,
  },
  infoBannerText: {
    fontSize: 14,
    fontFamily: Fonts.mono,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainerSmall: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.mono,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.mono,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 13,
    fontFamily: Fonts.mono,
    textAlign: 'center',
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

  windowSection: {
    marginBottom: 16,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#CCCCCC',
  },
});