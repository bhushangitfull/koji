/**
 * Flashcard Generator
 * Generates flashcards from extracted vocabulary using mock data + OpenAI
 */

import { supabase } from '@/utils/supabase';

// Mock Japanese vocabulary dictionary for offline use
const VOCABULARY_DICTIONARY: Record<string, {
  furigana: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence: string;
}> = {
  '進撃': {
    furigana: 'しんげき',
    meaning: 'advance/charge/attack',
    partOfSpeech: 'noun',
    exampleSentence: '進撃の巨人は面白いです。',
  },
  '巨人': {
    furigana: 'きょじん',
    meaning: 'giant',
    partOfSpeech: 'noun',
    exampleSentence: '巨人が来た。',
  },
  '壁': {
    furigana: 'かべ',
    meaning: 'wall',
    partOfSpeech: 'noun',
    exampleSentence: '壁の外に何がありますか。',
  },
  '勇気': {
    furigana: 'ゆうき',
    meaning: 'courage/bravery',
    partOfSpeech: 'noun',
    exampleSentence: '勇気を持って進みましょう。',
  },
  '戦う': {
    furigana: 'たたかう',
    meaning: 'to fight/to battle',
    partOfSpeech: 'verb',
    exampleSentence: '敵と戦う。',
  },
  '強い': {
    furigana: 'つよい',
    meaning: 'strong/powerful',
    partOfSpeech: 'adjective',
    exampleSentence: 'これは強い力です。',
  },
  '守る': {
    furigana: 'まもる',
    meaning: 'to protect/to defend',
    partOfSpeech: 'verb',
    exampleSentence: '家族を守る。',
  },
  '鬼滅': {
    furigana: 'きめつ',
    meaning: 'demon slayer',
    partOfSpeech: 'noun',
    exampleSentence: '鬼滅の刃が好きです。',
  },
  '柱': {
    furigana: 'はしら',
    meaning: 'pillar/column',
    partOfSpeech: 'noun',
    exampleSentence: '彼は強い柱です。',
  },
  '修行': {
    furigana: 'しゅぎょう',
    meaning: 'training/practice',
    partOfSpeech: 'noun',
    exampleSentence: '毎日修行をします。',
  },
};

// Get vocabulary info from dictionary (fallback)
function getFromDictionary(word: string) {
  return VOCABULARY_DICTIONARY[word] || null;
}

// Generate definition using OpenAI (optional, requires API key)
export async function generateDefinitionWithAI(word: string, apiKey?: string) {
  if (!apiKey) {
    return getFromDictionary(word);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `You are a Japanese language expert. For the Japanese word "${word}", provide a JSON response with exactly this format:
{
  "furigana": "hiragana reading",
  "meaning": "English translation (one line, concise)",
  "partOfSpeech": "noun/verb/adjective/etc",
  "exampleSentence": "example sentence using the word"
}
Only return valid JSON, no other text.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      console.warn(`OpenAI API error: ${response.statusText}`);
      return getFromDictionary(word);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return getFromDictionary(word);
    }

    try {
      return JSON.parse(content);
    } catch {
      return getFromDictionary(word);
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return getFromDictionary(word);
  }
}

// Create flashcard in Supabase
export async function createFlashcard(
  episodeId: string,
  word: string,
  definition: any
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        episode_id: episodeId,
        vocab_id: crypto.getRandomUUID?.() || `vocab_${Date.now()}`,
        japanese_text: word,
        english_translation: definition.meaning,
        furigana: definition.furigana,
        part_of_speech: definition.partOfSpeech,
        example_sentence: definition.exampleSentence,
        audio_url: null, // Can be added later
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating flashcard:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createFlashcard:', error);
    return null;
  }
}

// Generate flashcards for multiple words
export async function generateFlashcardsForEpisode(
  episodeId: string,
  vocabulary: string[],
  openaiKey?: string
): Promise<{ success: boolean; cardCount: number; cardIds: string[] }> {
  const cardIds: string[] = [];
  let created = 0;

  for (const word of vocabulary) {
    try {
      // Get definition (from dictionary or AI)
      const definition = await generateDefinitionWithAI(word, openaiKey);

      if (!definition) {
        console.warn(`No definition found for word: ${word}`);
        continue;
      }

      // Create flashcard in Supabase
      const cardId = await createFlashcard(episodeId, word, definition);

      if (cardId) {
        cardIds.push(cardId);
        created++;
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing word ${word}:`, error);
    }
  }

  return {
    success: created > 0,
    cardCount: created,
    cardIds,
  };
}

// Create quiz questions from flashcards
export async function generateQuizForEpisode(
  episodeId: string,
  flashcardIds: string[]
): Promise<{ success: boolean; quizId: string | null }> {
  if (flashcardIds.length === 0) {
    return { success: false, quizId: null };
  }

  try {
    // Create quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        episode_id: episodeId,
        title: `Flashcard Review Quiz`,
        total_questions: flashcardIds.length,
      })
      .select('id')
      .single();

    if (quizError) {
      console.error('Error creating quiz:', quizError);
      return { success: false, quizId: null };
    }

    const quizId = quiz?.id;

    if (!quizId) {
      return { success: false, quizId: null };
    }

    // Fetch flashcard data to create questions
    const { data: cards, error: cardsError } = await supabase
      .from('flashcards')
      .select('id, japanese_text, english_translation')
      .in('id', flashcardIds);

    if (cardsError || !cards) {
      console.error('Error fetching flashcards:', cardsError);
      return { success: false, quizId: null };
    }

    // Create multiple choice questions
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      // Generate multiple choice options (correct answer + 3 wrong answers)
      const allAnswers = cards.map((c) => c.english_translation);
      const correctAnswer = card.english_translation;
      const wrongAnswers = allAnswers.filter((a) => a !== correctAnswer).slice(0, 3);

      // Ensure we have 3 wrong answers
      if (wrongAnswers.length < 3) {
        wrongAnswers.push('unknown meaning');
        wrongAnswers.push('different definition');
        wrongAnswers.push('another translation');
      }

      const options = [correctAnswer, ...wrongAnswers.slice(0, 3)];
      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      await supabase.from('quiz_questions').insert({
        quiz_id: quizId,
        question_type: 'multiple_choice',
        question_text: `What does "${card.japanese_text}" mean?`,
        correct_answer: correctAnswer,
        options: options,
        display_order: i + 1,
      });
    }

    return { success: true, quizId };
  } catch (error) {
    console.error('Error generating quiz:', error);
    return { success: false, quizId: null };
  }
}

// Main function: Generate everything for an episode
export async function generateLearningMaterialsForEpisode(
  episodeId: string,
  vocabulary: string[],
  openaiKey?: string
): Promise<{
  success: boolean;
  flashcards: number;
  quizId: string | null;
  message: string;
}> {
  try {
    // Step 1: Generate flashcards
    const flashcardResult = await generateFlashcardsForEpisode(
      episodeId,
      vocabulary,
      openaiKey
    );

    if (!flashcardResult.success) {
      return {
        success: false,
        flashcards: 0,
        quizId: null,
        message: 'Failed to generate flashcards',
      };
    }

    // Step 2: Generate quiz from flashcards
    const quizResult = await generateQuizForEpisode(
      episodeId,
      flashcardResult.cardIds
    );

    return {
      success: true,
      flashcards: flashcardResult.cardCount,
      quizId: quizResult.quizId,
      message: `Created ${flashcardResult.cardCount} flashcards and quiz`,
    };
  } catch (error) {
    console.error('Error in generateLearningMaterialsForEpisode:', error);
    return {
      success: false,
      flashcards: 0,
      quizId: null,
      message: 'Error generating learning materials',
    };
  }
}
