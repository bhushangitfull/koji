import { RetroButton } from '@/components/ui/retro-button';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOTIVATIONAL_QUOTES = [
  'Consistency is key! Try to study a little bit every day.',
  'Every episode watched is progress made!',
  'Small steps lead to big achievements!',
  'Knowledge is the best investment.',
  'You got this! Keep pushing forward!',
];

const RECENT_ACTIVITIES = [
  { id: 1, title: 'Completed Episode 5', time: '2 hours ago', type: 'completed' },
  { id: 2, title: 'Started Vocabulary Quiz', time: '5 hours ago', type: 'started' },
  { id: 3, title: 'Finished Grammar Lesson', time: '1 day ago', type: 'completed' },
];

const ACHIEVEMENTS = [
  { id: 1, name: 'First Step', icon: 'RS', unlocked: true },
  { id: 2, name: '5-Day Streak', icon: 'ST', unlocked: false },
  { id: 3, name: 'Speed Learner', icon: 'SL', unlocked: true },
  { id: 4, name: 'Dedicated', icon: 'DD', unlocked: false },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
      {/* Welcome Window */}
      <RetroWindow
        title="Welcome"
        color="pink"
        style={styles.windowSection}
      >
        <Text style={[styles.title, { color: '#000000' }]}>Koji Study Hub</Text>
        <Text style={[styles.subtitle, { color: '#333333' }]}>
          Your personal anime & language learning companion
        </Text>
      </RetroWindow>

      {/* Study Streak */}
      {/* <RetroWindow
        title="Current Streak"
        color="purple"
        style={styles.windowSection}
      >
        <View style={styles.streakContainer}>
          <Text style={[styles.streakNumber, { color: colors.primary }]}>12</Text>
          <Text style={[styles.streakLabel, { color: '#333333' }]}>Days</Text>
          <Text style={[styles.streakSubtext, { color: '#666666' }]}>Keep it going!</Text>
        </View>
      </RetroWindow> */}

      {/* Daily Goal */}
      {/* <RetroWindow
        title="Daily Goal"
        color="pink"
        style={styles.windowSection}
      >
        <View style={styles.goalContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%', backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.goalText, { color: '#333333' }]}>
            60% complete - 30 more minutes to go!
          </Text>
        </View>
      </RetroWindow> */}

      {/* Quick Actions */}
      <RetroWindow
        title="Quick Actions"
        color="purple"
        style={styles.windowSection}
      >
        <View style={styles.buttonGrid}>
          <RetroButton
            variant="primary"
            size="medium"
            onPress={() => {}}
            style={styles.actionButton}
          >
            Start Study
          </RetroButton>
          <RetroButton
            variant="secondary"
            size="medium"
            onPress={() => {}}
            style={styles.actionButton}
          >
            View Library
          </RetroButton>
        </View>
        <View style={styles.buttonGrid}>
          <RetroButton
            variant="outline"
            size="medium"
            onPress={() => {}}
            style={styles.actionButton}
          >
            Check Progress
          </RetroButton>
          <RetroButton
            variant="primary"
            size="medium"
            onPress={() => {}}
            style={styles.actionButton}
          >
            My Profile
          </RetroButton>
        </View>
      </RetroWindow>

      {/* Stats Window */}
      <RetroWindow
        title="Today's Stats"
        color="purple"
        style={styles.windowSection}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: '#333333' }]}>Minutes</Text>
            <Text style={[styles.statLabel, { color: '#666666' }]}>Studied</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
            <Text style={[styles.statLabel, { color: '#333333' }]}>Topics</Text>
            <Text style={[styles.statLabel, { color: '#666666' }]}>Completed</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>0%</Text>
            <Text style={[styles.statLabel, { color: '#333333' }]}>Progress</Text>
            <Text style={[styles.statLabel, { color: '#666666' }]}>Overall</Text>
          </View>
        </View>
      </RetroWindow>

      {/* Recent Activity */}
      <RetroWindow
        title="Recent Activity"
        color="pink"
        style={styles.windowSection}
      >
        {RECENT_ACTIVITIES.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <Text style={[styles.activityTitle, { color: '#000000' }]}>
              {activity.type === 'completed' ? '[C]' : '[P]'} {activity.title}
            </Text>
            <Text style={[styles.activityTime, { color: '#666666' }]}>{activity.time}</Text>
          </View>
        ))}
      </RetroWindow>

      {/* Achievements */}
      <RetroWindow
        title="Achievements"
        color="purple"
        style={styles.windowSection}
      >
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementItem,
                { opacity: achievement.unlocked ? 1 : 0.5 },
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={[styles.achievementName, { color: '#333333' }]}>
                {achievement.name}
              </Text>
              {!achievement.unlocked && (
                <Text style={[styles.lockedBadge, { color: '#999999' }]}>[L]</Text>
              )}
            </View>
          ))}
        </View>
      </RetroWindow>

      {/* Study Schedule */}
      {/* <RetroWindow
        title="Study Schedule"
        color="pink"
        style={[styles.windowSection, { marginBottom: 40 }]}
      >
        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleItem}>
            <Text style={[styles.scheduleDay, { color: '#333333' }]}>Monday</Text>
            <Text style={[styles.scheduleTime, { color: colors.primary }]}>2:00 PM</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={[styles.scheduleDay, { color: '#333333' }]}>Wednesday</Text>
            <Text style={[styles.scheduleTime, { color: colors.primary }]}>3:00 PM</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={[styles.scheduleDay, { color: '#333333' }]}>Friday</Text>
            <Text style={[styles.scheduleTime, { color: colors.primary }]}>2:30 PM</Text>
          </View>
        </View>
      </RetroWindow> */}
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
    paddingTop: 20,
  },
  windowSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans,
  },
  /* Streak Styles */
  streakContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: Fonts.sans,
  },
  streakSubtext: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.sans,
  },
  /* Goal Styles */
  goalContainer: {
    paddingVertical: 12,
  },
  progressBar: {
    height: 24,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  goalText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
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
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: Fonts.rounded,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    fontFamily: Fonts.sans,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#CCCCCC',
  },
  /* Activity Styles */
  activityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  activityTime: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: Fonts.sans,
  },
  /* Achievement Styles */
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  achievementItem: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDDDDD',
    paddingVertical: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
  lockedBadge: {
    fontSize: 10,
    marginTop: 4,
  },
  /* Schedule Styles */
  scheduleContainer: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB6D9',
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    fontFamily: Fonts.sans,
  },
});
