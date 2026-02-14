import { RetroButton } from '@/components/ui/retro-button';
import { RetroWindow } from '@/components/ui/retro-window';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useQuizzes, useQuizQuestions } from '@/hooks/useQuizzes';
import { useEpisodes } from '@/hooks/useEpisodes';
import { useFlashcardProgress } from '@/hooks/useFlashcardProgress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/utils/supabase';
import { Flashcard, QuizQuestion, QuestionType, QuizAttempt } from '@/types/study';
import { updateUserStats, recordQuizAttempt } from '@/utils/statsUtils';

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

const DAILY_CHALLENGES = [
  { id: 1, title: 'Learn 20 new words', points: 50, completed: true },
  { id: 2, title: 'Complete 3 quizzes', points: 75, completed: false },
  { id: 3, title: 'Achieve 80%+ on weekly test', points: 100, completed: false },
  { id: 4, title: 'Build 5-day streak', points: 60, completed: true },
];

interface SessionState {
  type: 'flashcard' | 'quiz';
  episodeId: string;
  episodeTitle: string;
  data: Flashcard[] | QuizQuestion[];
  quizId?: string;
}

// Separate component for each episode card to fetch its own data
function EpisodeCard({ episode, colors, onOpenFlashcard, onOpenQuiz }: any) {
  const { flashcards } = useFlashcards(episode.id);
  const { quizzes } = useQuizzes(episode.id);

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionLeft}>
          <View style={[styles.sessionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Feather name="video" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sessionTitle, { color: '#000000' }]}>
              {episode.title}
            </Text>
            <Text style={[styles.sessionDescription, { color: '#666666' }]}>
              Learn vocabulary from this episode
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.episodeActions}>
        {flashcards.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() =>
              onOpenFlashcard(episode.id, episode.title)
            }
          >
            <Text
              style={[
                styles.actionButtonText,
                { color: colors.primary },
              ]}
            >
              📚 Flashcards ({flashcards.length})
            </Text>
          </TouchableOpacity>
        )}

        {quizzes.length > 0 ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={async () => {
              const firstQuiz = quizzes[0];
              await onOpenQuiz(episode.id, episode.title, firstQuiz.id);
            }}
          >
            <Text style={[styles.actionButtonText, { color: '#FFF' }]}>
              ✏️ Quiz ({quizzes[0]?.total_questions || 0} Q)
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#E0E0E0' }]}
            disabled
          >
            <Text style={[styles.actionButtonText, { color: '#999999' }]}>
              ✏️ No quiz yet
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function StudyScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  
  // Data hooks
  const { episodes, loading: episodesLoading } = useEpisodes();
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>();
  const { flashcards } = useFlashcards(selectedEpisodeId);
  const { quizzes } = useQuizzes(selectedEpisodeId);
  const [selectedQuizId, setSelectedQuizId] = useState<string | undefined>();
  const { questions: quizQuestions } = useQuizQuestions(selectedQuizId);
  const { progress: flashcardProgress, recordFlashcardReview } = useFlashcardProgress(user?.id);

  // UI state
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [activeSession, setActiveSession] = useState<SessionState | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
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

  const openFlashcardModal = (episodeId: string, episodeTitle: string) => {
    setSelectedEpisodeId(episodeId);
    setActiveSession({
      type: 'flashcard',
      episodeId,
      episodeTitle,
      data: flashcards,
    });
    setCurrentQuestionIndex(0);
    setFlipped(false);
    setUserAnswers({});
    setQuizScore(null);
    setTestModalVisible(true);
  };

  const openQuizModal = async (episodeId: string, episodeTitle: string, quizId: string) => {
    setSelectedEpisodeId(episodeId);
    setSelectedQuizId(quizId);
    
    try {
      // Fetch quiz questions directly
      const { data: questions, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true });
      
      if (error || !questions) {
        console.error('Error fetching quiz questions:', error);
        Alert.alert('Error', 'Failed to load quiz questions');
        return;
      }
      
      setActiveSession({
        type: 'quiz',
        episodeId,
        episodeTitle,
        data: questions,
        quizId,
      });
      setCurrentQuestionIndex(0);
      setFlipped(false);
      setUserAnswers({});
      setQuizScore(null);
      setTestModalVisible(true);
    } catch (err) {
      console.error('Error in openQuizModal:', err);
      Alert.alert('Error', 'Failed to open quiz');
    }
  };

  const closeTestModal = () => {
    setTestModalVisible(false);
    setActiveSession(null);
    setUserAnswers({});
    setQuizScore(null);
    setSelectedEpisodeId(undefined);
    setSelectedQuizId(undefined);
  };

  const renderTestContent = () => {
    if (!activeSession) return null;

    if (activeSession.type === 'flashcard' && flashcards.length > 0) {
      const card = flashcards[currentQuestionIndex];
      return (
        <View style={styles.testContent}>
          <Text style={[styles.testQuestion, { color: '#000000' }]}>
            Word {currentQuestionIndex + 1}
          </Text>
          <View style={[styles.vocabCard, { borderColor: colors.primary }]}>
            <Text style={[styles.vocabWord, { color: colors.primary }]}>
              {card.japanese_text}
            </Text>
            {card.furigana && (
              <Text style={[styles.vocabReading, { color: '#666666' }]}>
                {card.furigana}
              </Text>
            )}
            <Text style={[styles.vocabMeaning, { color: '#333333' }]}>
              {card.english_translation}
            </Text>
            {card.part_of_speech && (
              <Text style={[styles.vocabPos, { color: '#999999' }]}>
                ({card.part_of_speech})
              </Text>
            )}
            {card.audio_url && (
              <AudioPlayer
                audioUrl={card.audio_url}
                startTime={card.audio_start_time}
                endTime={card.audio_end_time}
                label="Pronunciation"
              />
            )}
            {card.example_sentence && (
              <View style={[styles.vocabExample, { backgroundColor: colors.primary + '10' }]}>
                <Text style={[styles.vocabExampleText, { color: '#666666' }]}>
                  Example: {card.example_sentence}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    if (activeSession.type === 'quiz' && activeSession.data.length > 0) {
      const question = activeSession.data[currentQuestionIndex];
      const isAnswered = userAnswers[question.id] !== undefined;

      // Flashcard Review format - NOW A PROPER QUIZ
      if (question.question_type === 'flashcard_review' || question.question_type === QuestionType.FLASHCARD_REVIEW) {
        const isAnswered = userAnswers[question.id] !== undefined;
        const userCorrect = userAnswers[question.id] === 'correct';
        const totalQuestions = activeSession.data.length;
        const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

        return (
          <View style={styles.testContent}>
            {/* Progress Header */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[styles.testQuestion, { color: '#000000', fontSize: 16 }]}>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </Text>
                <Text style={[styles.testQuestion, { color: colors.primary, fontSize: 16, fontWeight: 'bold' }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
              {/* Progress Bar */}
              <View style={{ backgroundColor: '#E0E0E0', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    height: '100%',
                    width: `${progress}%`,
                  }}
                />
              </View>
            </View>

            {/* Quiz Card */}
            <View style={[styles.vocabCard, { borderColor: colors.primary, marginVertical: 24, borderWidth: 2 }]}>
              <Text style={[styles.vocabWord, { color: colors.primary, fontSize: 36, marginBottom: 12 }]}>
                {question.question_text}
              </Text>
              <Text style={[styles.vocabMeaning, { color: '#666666', fontSize: 14, marginBottom: 20 }]}>
                What does this word mean?
              </Text>
              {flipped ? (
                <>
                  <Text style={[styles.vocabMeaning, { color: '#333333', fontSize: 18, fontWeight: 'bold' }]}>
                    {question.correct_answer}
                  </Text>
                  {!isAnswered && (
                    <View style={{ marginTop: 20, gap: 12 }}>
                      <TouchableOpacity
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: '#A8E6CF',
                            borderColor: '#7FE5DE',
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => {
                          setUserAnswers({ ...userAnswers, [question.id]: 'correct' });
                        }}
                      >
                        <Text style={[styles.optionText, { color: '#000000', fontWeight: 'bold', fontSize: 16 }]}>
                          ✓ Correct
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: '#FFB3B3',
                            borderColor: '#FF6B6B',
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => {
                          setUserAnswers({ ...userAnswers, [question.id]: 'incorrect' });
                        }}
                      >
                        <Text style={[styles.optionText, { color: '#000000', fontWeight: 'bold', fontSize: 16 }]}>
                          ✗ Incorrect
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                <Text style={[styles.vocabMeaning, { color: '#999999', fontSize: 14 }]}>
                  Click "Show Answer" to reveal
                </Text>
              )}
            </View>

            {/* Show/Hide Answer Button */}
            {!isAnswered && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary + '20', marginTop: 16 }]}
                onPress={() => setFlipped(!flipped)}
              >
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                  {flipped ? '👁️ Hide Answer' : '👁️ Show Answer'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Feedback */}
            {isAnswered && (
              <View
                style={[
                  styles.vocabExample,
                  {
                    backgroundColor: userCorrect ? '#A8E6CF30' : '#FF6B6B30',
                    borderColor: userCorrect ? '#7FE5DE' : '#FF6B6B',
                    borderWidth: 2,
                    marginTop: 16,
                  },
                ]}
              >
                <Text style={[styles.vocabExampleText, { color: userCorrect ? '#2B8659' : '#C92A2A', fontWeight: 'bold' }]}>
                  {userCorrect ? '✓ Correct! +10 pts' : '✗ Incorrect. 0 pts'}
                </Text>
              </View>
            )}
          </View>
        );
      }

      if (question.question_type === QuestionType.LISTENING && question.audio_url) {
        return (
          <View style={styles.testContent}>
            <Text style={[styles.testQuestion, { color: '#000000' }]}>
              {question.question_text}
            </Text>
            <AudioPlayer audioUrl={question.audio_url} label="Listen" />
            {question.options && (
              <View style={styles.optionsContainer}>
                {question.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor:
                          userAnswers[question.id] === option
                            ? colors.primary + '20'
                            : '#F5F5F5',
                        borderColor:
                          userAnswers[question.id] === option
                            ? colors.primary
                            : '#E0E0E0',
                      },
                    ]}
                    onPress={() =>
                      setUserAnswers({ ...userAnswers, [question.id]: option })
                    }
                  >
                    <Text style={[styles.optionText, { color: '#000000' }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      }

      if (question.question_type === QuestionType.FILL_BLANK) {
        return (
          <View style={styles.testContent}>
            <Text style={[styles.testQuestion, { color: '#000000' }]}>
              {question.question_text}
            </Text>
            <TextInput
              style={[
                styles.fillBlankInput,
                { borderColor: colors.primary, color: '#000000' },
              ]}
              placeholder="Type your answer..."
              placeholderTextColor="#999999"
              value={userAnswers[question.id] || ''}
              onChangeText={(text) =>
                setUserAnswers({ ...userAnswers, [question.id]: text })
              }
            />
          </View>
        );
      }

      // Multiple choice
      return (
        <View style={styles.testContent}>
          <Text style={[styles.testQuestion, { color: '#000000' }]}>
            {question.question_text}
          </Text>
          {question.options && (
            <View style={styles.optionsContainer}>
              {question.options.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor:
                        userAnswers[question.id] === option
                          ? colors.primary + '20'
                          : '#F5F5F5',
                      borderColor:
                        userAnswers[question.id] === option
                          ? colors.primary
                          : '#E0E0E0',
                    },
                  ]}
                  onPress={() =>
                    setUserAnswers({ ...userAnswers, [question.id]: option })
                  }
                >
                  <Text style={[styles.optionText, { color: '#000000' }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    }

    if (quizScore !== null) {
      const percentage = Math.round(quizScore);
      return (
        <View style={styles.testContent}>
          <Text style={[styles.testQuestion, { color: '#000000' }]}>Quiz Complete!</Text>
          <View
            style={[
              styles.scoreCard,
              { backgroundColor: colors.primary + '15', borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.scoreText, { color: colors.primary }]}>
              {percentage}%
            </Text>
            <Text style={[styles.scoreLabel, { color: '#666666' }]}>
              {percentage >= 80
                ? 'Excellent!'
                : percentage >= 60
                ? 'Good job!'
                : 'Keep practicing!'}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.testContent}>
        <Text style={[styles.testQuestion, { color: '#000000' }]}>No content available</Text>
      </View>
    );
  };

  const getMaxSamples = () => {
    if (activeSession?.type === 'flashcard') return flashcards.length;
    if (activeSession?.type === 'quiz') return activeSession.data.length;
    return 0;
  };

  const handleSubmitQuiz = async () => {
    if (!activeSession || !user || activeSession.type !== 'quiz') return;

    try {
      setSubmitting(true);
      let correctCount = 0;

      // Calculate score
      activeSession.data.forEach((question) => {
        const userAnswer = userAnswers[question.id];
        if (userAnswer && userAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
          correctCount++;
        }
      });

      const percentage = (correctCount / activeSession.data.length) * 100;
      setQuizScore(percentage);

      // Save quiz attempt to Supabase
      if (activeSession.quizId) {
        await supabase.from('user_quiz_attempts').insert({
          user_id: user.id,
          quiz_id: activeSession.quizId,
          score: correctCount,
          total_questions: activeSession.data.length,
          percentage_correct: Math.round(percentage),
          answers: userAnswers,
          attempted_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlashcardReview = async (isCorrect: boolean) => {
    if (!activeSession || !user || activeSession.type !== 'flashcard') return;

    const card = flashcards[currentQuestionIndex];
    if (!card) return;

    const success = await recordFlashcardReview(card.id, isCorrect, user.id);
    if (!success) {
      Alert.alert('Error', 'Failed to record flashcard review');
    }
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
          {episodesLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : episodes.length === 0 ? (
            <Text style={[styles.emptyText, { color: '#666666' }]}>
              No episodes available. Upload episodes to get started!
            </Text>
          ) : (
            episodes.map((episode) => (
              <EpisodeCard key={episode.id} episode={episode} colors={colors} onOpenFlashcard={openFlashcardModal} onOpenQuiz={openQuizModal} />
            ))
          )}
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
               <Text style={[styles.testModalTitle, { color: '#000000' }]}>
                 {activeSession?.type === 'flashcard' ? 'Flashcards' : 'Quiz'} - {activeSession?.episodeTitle}
               </Text>
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

               {activeSession?.type === 'quiz' &&
               currentQuestionIndex === getMaxSamples() - 1 &&
               quizScore === null ? (
                 <TouchableOpacity
                   style={[styles.navButton, { backgroundColor: colors.primary, padding: 12 }]}
                   onPress={handleSubmitQuiz}
                   disabled={submitting}
                 >
                   {submitting ? (
                     <ActivityIndicator color="#FFF" size="small" />
                   ) : (
                     <Text style={{ color: '#FFF', fontWeight: '600' }}>Submit</Text>
                   )}
                 </TouchableOpacity>
               ) : (
                 <TouchableOpacity
                   disabled={
                     currentQuestionIndex === getMaxSamples() - 1 ||
                     getMaxSamples() === 0
                   }
                   onPress={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                   style={[
                     styles.navButton,
                     {
                       opacity:
                         currentQuestionIndex === getMaxSamples() - 1 ||
                         getMaxSamples() === 0
                           ? 0.5
                           : 1,
                     },
                   ]}
                 >
                   <Feather name="chevron-right" size={24} color={colors.primary} />
                 </TouchableOpacity>
               )}
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
  /* New styles for real data */
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: Fonts.sans,
  },
  episodeActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Fonts.sans,
  },
  fillBlankInput: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    fontSize: 14,
    fontFamily: Fonts.sans,
  },
  scoreCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: Fonts.rounded,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
  vocabPos: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
