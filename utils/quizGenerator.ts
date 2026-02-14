import { supabase } from './supabase';
import { Flashcard } from '@/types/study';

/**
 * Auto-generate a quiz from flashcards for an episode
 * Creates quiz and multiple choice questions from flashcard vocabulary
 */
export async function generateQuizFromFlashcards(
  episodeId: string,
  flashcards: Flashcard[]
): Promise<string | null> {
  try {
    if (!flashcards || flashcards.length === 0) {
      console.log('No flashcards available for quiz generation');
      return null;
    }

    // Check if quiz already exists for this episode
    const { data: existingQuiz } = await supabase
      .from('quizzes')
      .select('id')
      .eq('episode_id', episodeId)
      .single();

    if (existingQuiz) {
      console.log('Quiz already exists for this episode:', existingQuiz.id);
      return existingQuiz.id;
    }

    // Create quiz
    const selectedFlashcards = flashcards.slice(0, 10); // Limit to first 10
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        episode_id: episodeId,
        title: `Quiz - Episode`,
        description: `Test your knowledge of this episode's vocabulary`,
        quiz_type: 'multiple_choice',
        total_questions: selectedFlashcards.length,
      })
      .select()
      .single();

    if (quizError || !quiz) {
      console.error('Error creating quiz:', quizError);
      return null;
    }

    // Generate questions from flashcards
    const questions = selectedFlashcards.map((card, index) => ({
      quiz_id: quiz.id,
      vocab_id: card.id,
      question_type: 'multiple_choice',
      question_text: `What is the meaning of "${card.japanese_text}" ${card.furigana ? `(${card.furigana})` : ''}?`,
      correct_answer: card.english_translation,
      options: generateMultipleChoiceOptions(card, flashcards),
    }));

    // Insert questions
    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questions);

    if (questionsError) {
      console.error('Error creating quiz questions:', questionsError);
      return quiz.id;
    }

    console.log(`Generated quiz with ${questions.length} questions`);
    return quiz.id;
  } catch (error) {
    console.error('Error in generateQuizFromFlashcards:', error);
    return null;
  }
}

/**
 * Generate 4 multiple choice options with the correct answer randomized
 */
function generateMultipleChoiceOptions(
  correctCard: Flashcard,
  allCards: Flashcard[]
): string[] {
  const options = [correctCard.english_translation];

  // Get random incorrect options from other flashcards
  const shuffled = allCards
    .filter((card) => card.id !== correctCard.id)
    .sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(3, shuffled.length); i++) {
    options.push(shuffled[i].english_translation);
  }

  // Shuffle options so correct answer isn't always first
  return options.sort(() => Math.random() - 0.5);
}

/**
 * Generate all missing quizzes for all episodes with flashcards
 */
export async function generateAllMissingQuizzes() {
  try {
    console.log('Starting batch quiz generation...');

    // Get all episodes
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title');

    if (episodesError || !episodes) {
      console.error('Error fetching episodes:', episodesError);
      return;
    }

    let generatedCount = 0;
    for (const episode of episodes) {
      // Get flashcards for this episode
      const { data: flashcards, error: fcError } = await supabase
        .from('vocabulary')
        .select('*')
        .eq('episode_id', episode.id);

      if (!fcError && flashcards && flashcards.length > 0) {
        const quizId = await generateQuizFromFlashcards(episode.id, flashcards);
        if (quizId) {
          generatedCount++;
        }
      }
    }

    console.log(`Generated ${generatedCount} quizzes`);
  } catch (error) {
    console.error('Error in generateAllMissingQuizzes:', error);
  }
}
