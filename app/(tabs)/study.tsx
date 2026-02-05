import { RetroButton } from '@/components/ui/retro-button';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock streak calendar data - 52 weeks * 7 days
const generateStreakData = () => {
  const data = [];
  for (let i = 0; i < 364; i++) {
    const random = Math.random();
    data.push({
      date: new Date(Date.now() - i * 86400000),
      level: random > 0.7 ? 4 : random > 0.4 ? 3 : random > 0.2 ? 2 : random > 0.05 ? 1 : 0,
    });
  }
  return data.reverse();
};

const getStreakColor = (level: number) => {
  switch (level) {
    case 0:
      return '#EEEEEE';
    case 1:
      return '#C6E9C3';
    case 2:
      return '#7FE5DE';
    case 3:
      return '#9B59B6';
    case 4:
      return '#6A3D8C';
    default:
      return '#EEEEEE';
  }
};

const STUDY_SESSIONS = [
  {
    id: 1,
    type: 'vocabulary',
    title: 'Vocabulary Review',
    description: 'Learn 15 new words from Attack on Titan',
    duration: '12 mins',
    progress: 8,
    total: 15,
    icon: 'book-open',
  },
  {
    id: 2,
    type: 'quiz',
    title: 'Episode Quiz',
    description: 'Demon Slayer Episode 5 - Fill in the blanks',
    duration: '8 mins',
    progress: 0,
    total: 10,
    icon: 'help-circle',
  },
  {
    id: 4,
    type: 'phrases',
    title: 'Phrases Test',
    description: 'Master common phrases and expressions',
    duration: '10 mins',
    progress: 0,
    total: 12,
    icon: 'message-circle',
  },
];

const VOCABULARY_SAMPLES = [
  { id: 1, word: '進撃', reading: 'しんげき', meaning: 'advance/charge', example: '進撃の巨人' },
  { id: 2, word: '巨人', reading: 'きょじん', meaning: 'giant', example: '巨人が来た' },
  { id: 3, word: '壁', reading: 'かべ', meaning: 'wall', example: '壁の外' },
];

const QUIZ_SAMPLES = [
  {
    id: 1,
    question: 'What does "勇気" mean?',
    options: ['courage', 'fear', 'anger', 'sadness'],
    correct: 0,
  },
  {
    id: 2,
    question: 'Fill the blank: 私は___が好きです (I like ___)',
    options: ['books', 'water', 'music', 'sleep'],
    correct: 2,
  },
];

const KANJI_SAMPLES = [
  { id: 1, kanji: '火', reading: 'ひ', meaning: 'fire', strokes: 4 },
  { id: 2, kanji: '木', reading: 'き', meaning: 'tree', strokes: 4 },
  { id: 3, kanji: '水', reading: 'みず', meaning: 'water', strokes: 4 },
];

const PHRASES_SAMPLES = [
  { id: 1, phrase: 'おはようございます', reading: 'ohayou gozaimasu', meaning: 'Good morning (polite)', context: 'Greeting' },
  { id: 2, phrase: 'ありがとうございます', reading: 'arigatou gozaimasu', meaning: 'Thank you very much', context: 'Gratitude' },
  { id: 3, phrase: 'すみません', reading: 'sumimasen', meaning: 'Excuse me / Sorry', context: 'Apology' },
];

const DAILY_CHALLENGES = [
  { id: 1, title: 'Learn 20 new words', points: 50, completed: true },
  { id: 2, title: 'Complete 3 quizzes', points: 75, completed: false },
  { id: 3, title: 'Achieve 80%+ on weekly test', points: 100, completed: false },
  { id: 4, title: 'Build 5-day streak', points: 60, completed: true },
];

export default function StudyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const streakData = generateStreakData();

  const renderStreakDay = (item: { date: Date; level: number }, index: number) => (
    <View
      key={index}
      style={[
        styles.streakDay,
        {
          backgroundColor: getStreakColor(item.level),
          borderColor: '#D0D0D0',
        },
      ]}
      title={item.date.toDateString()}
    />
  );

  const openTestModal = (session: any) => {
    setActiveSession(session);
    setCurrentQuestionIndex(0);
    setFlipped(false);
    setTestModalVisible(true);
  };

  const closeTestModal = () => {
    setTestModalVisible(false);
    setActiveSession(null);
  };

  const renderTestContent = () => {
    if (!activeSession) return null;

    if (activeSession.type === 'vocabulary') {
      const sample = VOCABULARY_SAMPLES[currentQuestionIndex];
      return (
        <View style={styles.testContent}>
          <Text style={[styles.testQuestion, { color: '#000000' }]}>Word {currentQuestionIndex + 1}</Text>
          <View style={[styles.vocabCard, { borderColor: colors.primary }]}>
            <Text style={[styles.vocabWord, { color: colors.primary }]}>{sample.word}</Text>
            <Text style={[styles.vocabReading, { color: '#666666' }]}>{sample.reading}</Text>
            <Text style={[styles.vocabMeaning, { color: '#333333' }]}>{sample.meaning}</Text>
            <View style={[styles.vocabExample, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.vocabExampleText, { color: '#666666' }]}>Example: {sample.example}</Text>
            </View>
          </View>
        </View>
      );
    }

    if (activeSession.type === 'quiz') {
      const quiz = QUIZ_SAMPLES[currentQuestionIndex];
      return (
        <View style={styles.testContent}>
          <Text style={[styles.testQuestion, { color: '#000000' }]}>{quiz.question}</Text>
          <View style={styles.optionsContainer}>
            {quiz.options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: idx === quiz.correct ? colors.primary + '20' : '#F5F5F5',
                    borderColor: idx === quiz.correct ? colors.primary : '#E0E0E0',
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: '#000000' }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    if (activeSession.type === 'flashcard') {
      const kanji = KANJI_SAMPLES[currentQuestionIndex];
      return (
        <TouchableOpacity onPress={() => setFlipped(!flipped)} style={styles.testContent}>
          <Text style={[styles.testQuestion, { color: '#000000' }]}>Kanji {currentQuestionIndex + 1}</Text>
          <View style={[styles.flashcard, { backgroundColor: flipped ? colors.primary + '15' : '#FFF' }]}>
            {!flipped ? (
              <>
                <Text style={[styles.kanjiLarge, { color: colors.primary }]}>{kanji.kanji}</Text>
                <Text style={[styles.flipHint, { color: '#999999' }]}>Tap to reveal</Text>
              </>
            ) : (
              <>
                <Text style={[styles.kanjiReading, { color: '#333333' }]}>{kanji.reading}</Text>
                <Text style={[styles.kanjiMeaning, { color: '#666666' }]}>{kanji.meaning}</Text>
                <Text style={[styles.kanjiStrokes, { color: '#9B59B6' }]}>Strokes: {kanji.strokes}</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    if (activeSession.type === 'phrases') {
      const phrase = PHRASES_SAMPLES[currentQuestionIndex];
      return (
        <View style={styles.testContent}>
          <Text style={[styles.testQuestion, { color: '#000000' }]}>Phrase {currentQuestionIndex + 1}</Text>
          <View style={[styles.phraseCard, { borderColor: colors.primary }]}>
            <Text style={[styles.phraseJapanese, { color: colors.primary }]}>{phrase.phrase}</Text>
            <Text style={[styles.phraseRomaji, { color: '#666666' }]}>{phrase.reading}</Text>
            <Text style={[styles.phraseMeaning, { color: '#333333' }]}>{phrase.meaning}</Text>
            <View style={[styles.phraseContext, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.phraseContextLabel, { color: '#9B59B6' }]}>Context:</Text>
              <Text style={[styles.phraseContextText, { color: '#666666' }]}>{phrase.context}</Text>
            </View>
          </View>
        </View>
      );
    }
  };

  const getMaxSamples = () => {
    if (activeSession?.type === 'vocabulary') return VOCABULARY_SAMPLES.length;
    if (activeSession?.type === 'quiz') return QUIZ_SAMPLES.length;
    if (activeSession?.type === 'flashcard') return KANJI_SAMPLES.length;
    if (activeSession?.type === 'phrases') return PHRASES_SAMPLES.length;
    return 0;
  };

  const renderStreakWeek = (weekDays: any[], weekIndex: number) => (
    <View key={weekIndex} style={styles.streakWeek}>
      {weekDays.map((day, dayIndex) => renderStreakDay(day, weekIndex * 7 + dayIndex))}
    </View>
  );

  const weeks = [];
  for (let i = 0; i < streakData.length; i += 7) {
    weeks.push(streakData.slice(i, i + 7));
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.retroBg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: '#000000' }]}>Study</Text>
          <Text style={[styles.subtitle, { color: '#666666' }]}>Learn vocabulary & take quizzes</Text>
        </View>

        {/* Streak Section - Expandable */}
        <TouchableOpacity
          onPress={() => setStreakModalVisible(true)}
          activeOpacity={0.8}
          style={[styles.streakHeader, { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
        >
          <View style={styles.streakInfo}>
            <MaterialIcons name="local-fire-department" size={28} color={colors.primary} />
            <View>
              <Text style={[styles.streakNumber, { color: colors.primary }]}>12</Text>
              <Text style={[styles.streakLabel, { color: '#666666' }]}>Day Streak</Text>
            </View>
          </View>
          <Feather name="chevron-down" size={24} color={colors.primary} />
        </TouchableOpacity>

        {/* Streak Calendar Modal */}
        <Modal
          visible={streakModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setStreakModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setStreakModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.streakModal, { backgroundColor: colors.retroBg }]}
              onPress={() => {}}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: '#000000' }]}>Your Study Streak</Text>
                <TouchableOpacity onPress={() => setStreakModalVisible(false)}>
                  <Feather name="x" size={24} color="#333333" />
                </TouchableOpacity>
              </View>

              <View style={styles.streakStats}>
                <View style={styles.streakStat}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
                  <Text style={[styles.statLabel, { color: '#666666' }]}>Current Streak</Text>
                </View>
                <View style={styles.streakStat}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>156</Text>
                  <Text style={[styles.statLabel, { color: '#666666' }]}>Total Days</Text>
                </View>
                <View style={styles.streakStat}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>31</Text>
                  <Text style={[styles.statLabel, { color: '#666666' }]}>Longest Streak</Text>
                </View>
              </View>

              <Text style={[styles.calendarLabel, { color: '#333333' }]}>Last 52 Weeks</Text>

              <ScrollView
                style={styles.streakCalendar}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {weeks.map((week, weekIndex) => renderStreakWeek(week, weekIndex))}
              </ScrollView>

              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#EEEEEE' }]} />
                  <Text style={[styles.legendText, { color: '#666666' }]}>None</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#C6E9C3' }]} />
                  <Text style={[styles.legendText, { color: '#666666' }]}>Low</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#7FE5DE' }]} />
                  <Text style={[styles.legendText, { color: '#666666' }]}>Mid</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#9B59B6' }]} />
                  <Text style={[styles.legendText, { color: '#666666' }]}>High</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: '#6A3D8C' }]} />
                  <Text style={[styles.legendText, { color: '#666666' }]}>Max</Text>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Daily Challenges */}
        <RetroWindow title="Daily Challenges" color="pink" style={styles.windowSection}>
          {DAILY_CHALLENGES.map((challenge) => (
            <View key={challenge.id} style={styles.challengeItem}>
              <View style={styles.challengeLeft}>
                <View
                  style={[
                    styles.challengeCheckbox,
                    {
                      backgroundColor: challenge.completed ? colors.primary : 'transparent',
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  {challenge.completed && <Feather name="check" size={14} color="#FFF" />}
                </View>
                <View>
                  <Text
                    style={[
                      styles.challengeTitle,
                      {
                        color: '#000000',
                        textDecorationLine: challenge.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {challenge.title}
                  </Text>
                  <Text style={[styles.challengePoints, { color: '#9B59B6' }]}>
                    +{challenge.points} pts
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </RetroWindow>

        {/* Study Sessions */}
        <RetroWindow title="Start Learning" color="purple" style={styles.windowSection}>
          {STUDY_SESSIONS.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionLeft}>
                  <View style={[styles.sessionIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Feather name={session.icon as any} size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.sessionTitle, { color: '#000000' }]}>{session.title}</Text>
                    <Text style={[styles.sessionDescription, { color: '#666666' }]}>
                      {session.description}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sessionDuration, { color: colors.primary }]}>{session.duration}</Text>
              </View>

              {session.progress > 0 && (
                <View style={styles.sessionProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(session.progress / session.total) * 100}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: '#666666' }]}>
                    {session.progress}/{session.total}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.sessionButton, { backgroundColor: colors.primary }]}
                onPress={() => openTestModal(session)}
              >
                <Text style={[styles.sessionButtonText, { color: '#FFF' }]}>
                  {session.progress > 0 ? 'Continue' : 'Start'}
                </Text>
                <Feather name="arrow-right" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ))}
        </RetroWindow>

         {/* Weekly Test CTA */}
        <RetroWindow title="This Week's Challenge" color="pink" style={[styles.windowSection, { marginBottom: 40 }]}>
          <View style={styles.testCTA}>
            <View style={{ gap: 8 }}>
              <Text style={[styles.testTitle, { color: '#000000' }]}>Weekly Comprehensive Test</Text>
              <Text style={[styles.testDescription, { color: '#666666' }]}>
                Test yourself on all vocabulary from this week's episodes. 25 questions, 15 minutes.
              </Text>
            </View>
            <RetroButton
              variant="primary"
              size="medium"
              onPress={() => {}}
              style={styles.testButton}
            >
              Take Test
            </RetroButton>
          </View>
        </RetroWindow>

        {/* Test Modal */}
        <Modal
          visible={testModalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeTestModal}
        >
          <SafeAreaView style={[styles.testModalContainer, { backgroundColor: colors.retroBg }]}>
            <View style={styles.testModalHeader}>
              <TouchableOpacity onPress={closeTestModal}>
                <Feather name="x" size={24} color="#333333" />
              </TouchableOpacity>
              <Text style={[styles.testModalTitle, { color: '#000000' }]}>{activeSession?.title}</Text>
              <View style={styles.testProgress}>
                <Text style={[styles.testProgressText, { color: '#666666' }]}>
                  {currentQuestionIndex + 1}/{getMaxSamples()}
                </Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.testModalContent}
              showsVerticalScrollIndicator={false}
            >
              {renderTestContent()}
            </ScrollView>

            <View style={styles.testModalFooter}>
              <TouchableOpacity
                disabled={currentQuestionIndex === 0}
                onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                style={[styles.navButton, { opacity: currentQuestionIndex === 0 ? 0.5 : 1 }]}
              >
                <Feather name="chevron-left" size={24} color={colors.primary} />
              </TouchableOpacity>

              <View style={styles.progressIndicator}>
                {Array.from({ length: getMaxSamples() }).map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.progressDot,
                      {
                        backgroundColor:
                          idx === currentQuestionIndex
                            ? colors.primary
                            : idx < currentQuestionIndex
                            ? colors.primary + '50'
                            : '#E0E0E0',
                      },
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                disabled={currentQuestionIndex === getMaxSamples() - 1}
                onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                style={[styles.navButton, { opacity: currentQuestionIndex === getMaxSamples() - 1 ? 0.5 : 1 }]}
              >
                <Feather name="chevron-right" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
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
    marginBottom: 20,
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
  /* Streak Section */
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  streakLabel: {
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  /* Streak Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  streakModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  streakStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: Fonts.sans,
  },
  calendarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
    fontFamily: Fonts.sans,
  },
  streakCalendar: {
    maxHeight: 300,
    marginBottom: 16,
  },
  streakWeek: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 4,
  },
  streakDay: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  legendText: {
    fontSize: 10,
    fontFamily: Fonts.sans,
  },
  windowSection: {
    marginBottom: 16,
  },
  /* Daily Challenges */
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  challengeCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  challengePoints: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: Fonts.rounded,
  },
  /* Study Sessions */
  sessionCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
  sessionDescription: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: Fonts.sans,
    maxWidth: 180,
  },
  sessionDuration: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
  sessionProgress: {
    marginBottom: 10,
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
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontFamily: Fonts.sans,
  },
  sessionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sessionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
  /* Weekly Test */
  testCTA: {
    gap: 12,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
  testDescription: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.sans,
  },
  testButton: {
    alignSelf: 'flex-start',
  },
  /* Test Modal */
  testModalContainer: {
    flex: 1,
  },
  testModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  testModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.sans,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  testProgress: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  testProgressText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  testModalContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  testContent: {
    gap: 16,
  },
  testQuestion: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Fonts.sans,
    textAlign: 'center',
  },
  /* Vocabulary Card */
  vocabCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    backgroundColor: '#FFF',
  },
  vocabWord: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  vocabReading: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
  vocabMeaning: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
  vocabExample: {
    borderRadius: 8,
    padding: 12,
  },
  vocabExampleText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  /* Quiz Options */
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  /* Flashcard */
  flashcard: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 32,
    aspectRatio: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  kanjiLarge: {
    fontSize: 80,
    fontWeight: 'bold',
  },
  kanjiReading: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  kanjiMeaning: {
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  kanjiStrokes: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  flipHint: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: Fonts.sans,
  },
  /* Phrases Card */
  phraseCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    backgroundColor: '#FFF',
  },
  phraseJapanese: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    textAlign: 'center',
  },
  phraseRomaji: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: Fonts.sans,
  },
  phraseMeaning: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Fonts.sans,
    fontWeight: '600',
  },
  phraseContext: {
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  phraseContextLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Fonts.sans,
  },
  phraseContextText: {
    fontSize: 12,
    fontFamily: Fonts.sans,
  },
  /* Modal Footer */
  testModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
