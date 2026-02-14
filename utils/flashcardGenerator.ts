/**
 * Flashcard Generator
 * Generates flashcards from extracted vocabulary using Jisho API + OpenAI
 */

import { supabase } from '@/utils/supabase';


// Jisho API Types
export interface JishoDefinition {
  kanji: string;
  hiragana: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence?: string;
}

// Query Jisho API for word definition
export async function getJishoDefinition(word: string): Promise<JishoDefinition | null> {
  try {
    console.log('[Jisho] Looking up word:', word);
    
    const response = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      console.warn(`[Jisho] API error: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('[Jisho] API Response:', data);
    
    if (!data.data || data.data.length === 0) {
      console.log('[Jisho] No results found for:', word);
      return null;
    }

    const entry = data.data[0];
    const japaneseEntry = entry.japanese?.[0];
    const definition = entry.senses?.[0];

    if (!japaneseEntry || !definition) {
      console.log('[Jisho] Missing japanese or senses data');
      return null;
    }

    const result: JishoDefinition = {
      kanji: japaneseEntry.word || word,
      hiragana: japaneseEntry.reading || '',
      meaning: (definition.english_definitions && definition.english_definitions[0]) || 'No definition found',
      partOfSpeech: (definition.parts_of_speech && definition.parts_of_speech[0]) || 'unknown',
      exampleSentence: '',
    };
    
    console.log('[Jisho] Definition found:', result);
    return result;
  } catch (error) {
    console.error('[Jisho] Error:', error);
    return null;
  }
}

// Mock Japanese vocabulary dictionary for offline use
const VOCABULARY_DICTIONARY: Record<string, {
  furigana: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence: string;
}> = {
  // Attack on Titan & Common Anime Vocabulary
  '進撃': { furigana: 'しんげき', meaning: 'advance/charge/attack', partOfSpeech: 'noun', exampleSentence: '進撃の巨人は面白いです。' },
  '巨人': { furigana: 'きょじん', meaning: 'giant', partOfSpeech: 'noun', exampleSentence: '巨人が来た。' },
  '壁': { furigana: 'かべ', meaning: 'wall', partOfSpeech: 'noun', exampleSentence: '壁の外に何がありますか。' },
  '勇気': { furigana: 'ゆうき', meaning: 'courage/bravery', partOfSpeech: 'noun', exampleSentence: '勇気を持って進みましょう。' },
  '戦う': { furigana: 'たたかう', meaning: 'to fight/to battle', partOfSpeech: 'verb', exampleSentence: '敵と戦う。' },
  '強い': { furigana: 'つよい', meaning: 'strong/powerful', partOfSpeech: 'i-adjective', exampleSentence: 'これは強い力です。' },
  '守る': { furigana: 'まもる', meaning: 'to protect/to defend', partOfSpeech: 'verb', exampleSentence: '家族を守る。' },
  '鬼滅': { furigana: 'きめつ', meaning: 'demon slayer', partOfSpeech: 'noun', exampleSentence: '鬼滅の刃が好きです。' },
  '柱': { furigana: 'はしら', meaning: 'pillar', partOfSpeech: 'noun', exampleSentence: '彼は強い柱です。' },
  '修行': { furigana: 'しゅぎょう', meaning: 'training/practice', partOfSpeech: 'noun', exampleSentence: '毎日修行をします。' },
  
  // Common Daily Vocabulary
  '好き': { furigana: 'すき', meaning: 'like/love', partOfSpeech: 'na-adjective', exampleSentence: '私はこの本が好きです。' },
  '嫌い': { furigana: 'きらい', meaning: 'hate/dislike', partOfSpeech: 'na-adjective', exampleSentence: '彼はネズミが嫌いです。' },
  '大きい': { furigana: 'おおきい', meaning: 'big/large', partOfSpeech: 'i-adjective', exampleSentence: '大きな家に住みます。' },
  '小さい': { furigana: 'ちいさい', meaning: 'small/little', partOfSpeech: 'i-adjective', exampleSentence: '小さい子どもです。' },
  '新しい': { furigana: 'あたらしい', meaning: 'new', partOfSpeech: 'i-adjective', exampleSentence: '新しい靴を買いました。' },
  '古い': { furigana: 'ふるい', meaning: 'old', partOfSpeech: 'i-adjective', exampleSentence: '古い建物です。' },
  '美しい': { furigana: 'うつくしい', meaning: 'beautiful', partOfSpeech: 'i-adjective', exampleSentence: '美しい景色ですね。' },
  '醜い': { furigana: 'みにくい', meaning: 'ugly', partOfSpeech: 'i-adjective', exampleSentence: '醜い怪物が現れた。' },
  '速い': { furigana: 'はやい', meaning: 'fast', partOfSpeech: 'i-adjective', exampleSentence: '彼は速く走ります。' },
  '遅い': { furigana: 'おそい', meaning: 'slow', partOfSpeech: 'i-adjective', exampleSentence: '遅い電車です。' },
  '熱い': { furigana: 'あつい', meaning: 'hot/passionate', partOfSpeech: 'i-adjective', exampleSentence: 'お風呂が熱いです。' },
  '冷たい': { furigana: 'つめたい', meaning: 'cold', partOfSpeech: 'i-adjective', exampleSentence: '冷たい水を飲みます。' },
  '清潔': { furigana: 'せいけつ', meaning: 'clean', partOfSpeech: 'na-adjective', exampleSentence: '清潔な部屋です。' },
  '汚い': { furigana: 'きたない', meaning: 'dirty', partOfSpeech: 'i-adjective', exampleSentence: '汚い道路です。' },
  '深い': { furigana: 'ふかい', meaning: 'deep', partOfSpeech: 'i-adjective', exampleSentence: '深い川です。' },
  '浅い': { furigana: 'あさい', meaning: 'shallow', partOfSpeech: 'i-adjective', exampleSentence: '浅い池です。' },
  
  // Actions & Verbs
  '食べる': { furigana: 'たべる', meaning: 'to eat', partOfSpeech: 'verb', exampleSentence: '朝ご飯を食べます。' },
  '飲む': { furigana: 'のむ', meaning: 'to drink', partOfSpeech: 'verb', exampleSentence: 'コーヒーを飲みます。' },
  '作る': { furigana: 'つくる', meaning: 'to make', partOfSpeech: 'verb', exampleSentence: 'ケーキを作ります。' },
  '読む': { furigana: 'よむ', meaning: 'to read', partOfSpeech: 'verb', exampleSentence: '本を読みます。' },
  '書く': { furigana: 'かく', meaning: 'to write', partOfSpeech: 'verb', exampleSentence: '手紙を書きます。' },
  '見る': { furigana: 'みる', meaning: 'to see/to watch', partOfSpeech: 'verb', exampleSentence: 'テレビを見ます。' },
  '聞く': { furigana: 'きく', meaning: 'to hear/to listen', partOfSpeech: 'verb', exampleSentence: '音楽を聞きます。' },
  '話す': { furigana: 'はなす', meaning: 'to speak', partOfSpeech: 'verb', exampleSentence: '日本語を話します。' },
  '言う': { furigana: 'いう', meaning: 'to say', partOfSpeech: 'verb', exampleSentence: '何も言いません。' },
  '歩く': { furigana: 'あるく', meaning: 'to walk', partOfSpeech: 'verb', exampleSentence: '毎日歩きます。' },
  '走る': { furigana: 'はしる', meaning: 'to run', partOfSpeech: 'verb', exampleSentence: '公園で走ります。' },
  '乗る': { furigana: 'のる', meaning: 'to ride', partOfSpeech: 'verb', exampleSentence: '電車に乗ります。' },
  '降りる': { furigana: 'おりる', meaning: 'to get down', partOfSpeech: 'verb', exampleSentence: '駅で降ります。' },
  '寝る': { furigana: 'ねる', meaning: 'to sleep', partOfSpeech: 'verb', exampleSentence: '夜9時に寝ます。' },
  '起きる': { furigana: 'おきる', meaning: 'to wake up', partOfSpeech: 'verb', exampleSentence: '朝7時に起きます。' },
  '考える': { furigana: 'かんがえる', meaning: 'to think', partOfSpeech: 'verb', exampleSentence: '色々考えました。' },
  '忘れる': { furigana: 'わすれる', meaning: 'to forget', partOfSpeech: 'verb', exampleSentence: 'パスポートを忘れました。' },
  '覚える': { furigana: 'おぼえる', meaning: 'to remember', partOfSpeech: 'verb', exampleSentence: '名前を覚えました。' },
  '死ぬ': { furigana: 'しぬ', meaning: 'to die', partOfSpeech: 'verb', exampleSentence: '彼は死にました。' },
  '生きる': { furigana: 'いきる', meaning: 'to live', partOfSpeech: 'verb', exampleSentence: '生きることは大切です。' },
  
  // Family & People
  '家族': { furigana: 'かぞく', meaning: 'family', partOfSpeech: 'noun', exampleSentence: '私の家族は五人です。' },
  '父': { furigana: 'ちち', meaning: 'father', partOfSpeech: 'noun', exampleSentence: '父は医者です。' },
  '母': { furigana: 'はは', meaning: 'mother', partOfSpeech: 'noun', exampleSentence: '母は優しいです。' },
  '兄': { furigana: 'あに', meaning: 'older brother', partOfSpeech: 'noun', exampleSentence: '兄は大学生です。' },
  '弟': { furigana: 'おとうと', meaning: 'younger brother', partOfSpeech: 'noun', exampleSentence: '弟は中学生です。' },
  '姉': { furigana: 'あね', meaning: 'older sister', partOfSpeech: 'noun', exampleSentence: '姉は看護師です。' },
  '妹': { furigana: 'いもうと', meaning: 'younger sister', partOfSpeech: 'noun', exampleSentence: '妹は可愛いです。' },
  '子ども': { furigana: 'こども', meaning: 'child', partOfSpeech: 'noun', exampleSentence: '小さい子どもです。' },
  '人': { furigana: 'ひと', meaning: 'person', partOfSpeech: 'noun', exampleSentence: '良い人ですね。' },
  '友達': { furigana: 'ともだち', meaning: 'friend', partOfSpeech: 'noun', exampleSentence: '友達と遊びます。' },
  
  // Objects & Places
  '家': { furigana: 'いえ', meaning: 'house', partOfSpeech: 'noun', exampleSentence: '私の家は大きいです。' },
  '学校': { furigana: 'がっこう', meaning: 'school', partOfSpeech: 'noun', exampleSentence: '学校は遠いです。' },
  '会社': { furigana: 'かいしゃ', meaning: 'company', partOfSpeech: 'noun', exampleSentence: '会社は朝8時に始まります。' },
  '病院': { furigana: 'びょういん', meaning: 'hospital', partOfSpeech: 'noun', exampleSentence: '病院に行きます。' },
  '駅': { furigana: 'えき', meaning: 'station', partOfSpeech: 'noun', exampleSentence: '駅は近くです。' },
  '店': { furigana: 'みせ', meaning: 'shop/store', partOfSpeech: 'noun', exampleSentence: '店は閉じています。' },
  '道': { furigana: 'みち', meaning: 'road/way', partOfSpeech: 'noun', exampleSentence: 'この道はまっすぐです。' },
  '川': { furigana: 'かわ', meaning: 'river', partOfSpeech: 'noun', exampleSentence: '川は流れています。' },
  '海': { furigana: 'うみ', meaning: 'sea/ocean', partOfSpeech: 'noun', exampleSentence: '海が見えます。' },
  '山': { furigana: 'やま', meaning: 'mountain', partOfSpeech: 'noun', exampleSentence: '山は高いです。' },
  '森': { furigana: 'もり', meaning: 'forest/woods', partOfSpeech: 'noun', exampleSentence: '森は静かです。' },
  '公園': { furigana: 'こうえん', meaning: 'park', partOfSpeech: 'noun', exampleSentence: '公園で遊びます。' },
  '本': { furigana: 'ほん', meaning: 'book', partOfSpeech: 'noun', exampleSentence: 'その本は面白いです。' },
  '食べ物': { furigana: 'たべもの', meaning: 'food', partOfSpeech: 'noun', exampleSentence: '食べ物は美味しいです。' },
  '飲み物': { furigana: 'のみもの', meaning: 'drink/beverage', partOfSpeech: 'noun', exampleSentence: '飲み物は何ですか。' },
  '服': { furigana: 'ふく', meaning: 'clothes', partOfSpeech: 'noun', exampleSentence: '新しい服を買いました。' },
  '靴': { furigana: 'くつ', meaning: 'shoe', partOfSpeech: 'noun', exampleSentence: '靴は黒いです。' },
  '帽子': { furigana: 'ぼうし', meaning: 'hat', partOfSpeech: 'noun', exampleSentence: 'その帽子はいいです。' },
  '眼鏡': { furigana: 'めがね', meaning: 'glasses', partOfSpeech: 'noun', exampleSentence: '眼鏡をかけています。' },
  
  // Colors & Numbers
  '赤': { furigana: 'あか', meaning: 'red', partOfSpeech: 'noun', exampleSentence: '赤い花です。' },
  '青': { furigana: 'あお', meaning: 'blue', partOfSpeech: 'noun', exampleSentence: '青い空です。' },
  '黄色': { furigana: 'きいろ', meaning: 'yellow', partOfSpeech: 'noun', exampleSentence: '黄色い光です。' },
  '緑': { furigana: 'みどり', meaning: 'green', partOfSpeech: 'noun', exampleSentence: '緑の木があります。' },
  '白': { furigana: 'しろ', meaning: 'white', partOfSpeech: 'noun', exampleSentence: '白い雪です。' },
  '黒': { furigana: 'くろ', meaning: 'black', partOfSpeech: 'noun', exampleSentence: '黒い猫です。' },
  '一': { furigana: 'いち', meaning: 'one', partOfSpeech: 'noun', exampleSentence: '一つください。' },
  '二': { furigana: 'に', meaning: 'two', partOfSpeech: 'noun', exampleSentence: '二つあります。' },
  '三': { furigana: 'さん', meaning: 'three', partOfSpeech: 'noun', exampleSentence: '三人の人です。' },
  '十': { furigana: 'じゅう', meaning: 'ten', partOfSpeech: 'noun', exampleSentence: '十円です。' },
  '百': { furigana: 'ひゃく', meaning: 'hundred', partOfSpeech: 'noun', exampleSentence: '百冊の本があります。' },
  
  // Emotions & States
  '嬉しい': { furigana: 'うれしい', meaning: 'happy', partOfSpeech: 'i-adjective', exampleSentence: '嬉しい時は笑います。' },
  '悲しい': { furigana: 'かなしい', meaning: 'sad', partOfSpeech: 'i-adjective', exampleSentence: '悲しい映画を見ました。' },
  '怖い': { furigana: 'こわい', meaning: 'scary', partOfSpeech: 'i-adjective', exampleSentence: 'ホラー映画は怖いです。' },
  '面白い': { furigana: 'おもしろい', meaning: 'interesting/funny', partOfSpeech: 'i-adjective', exampleSentence: 'その話は面白いですね。' },
  '退屈': { furigana: 'たいくつ', meaning: 'boring', partOfSpeech: 'na-adjective', exampleSentence: '退屈な日です。' },
  '疲れた': { furigana: 'つかれた', meaning: 'tired', partOfSpeech: 'i-adjective', exampleSentence: '疲れました。' },
  '元気': { furigana: 'げんき', meaning: 'healthy/energetic', partOfSpeech: 'na-adjective', exampleSentence: '元気そうですね。' },
  '怒る': { furigana: 'おこる', meaning: 'to get angry', partOfSpeech: 'verb', exampleSentence: '先生は怒っています。' },
  '笑う': { furigana: 'わらう', meaning: 'to laugh', partOfSpeech: 'verb', exampleSentence: 'みんなで笑います。' },
  '泣く': { furigana: 'なく', meaning: 'to cry', partOfSpeech: 'verb', exampleSentence: '悲しくて泣きました。' },
};

// Get vocabulary info from dictionary (fallback)
export function getFromDictionary(word: string) {
  return VOCABULARY_DICTIONARY[word] || null;
}

// Generate definition using Jisho API (primary) + OpenAI (optional)
export async function generateDefinitionWithAI(word: string, apiKey?: string) {
  // Try Jisho first (real-time translation)
  const jishoResult = await getJishoDefinition(word);
  
  if (jishoResult) {
    return {
      furigana: jishoResult.hiragana,
      meaning: jishoResult.meaning,
      partOfSpeech: jishoResult.partOfSpeech,
      exampleSentence: jishoResult.exampleSentence || `Example with ${jishoResult.kanji}`,
    };
  }

  // Fallback to OpenAI if Jisho doesn't find it
  if (!apiKey) {
    return null;
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
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return null;
  }
}

// Create flashcard in Supabase
// Create or get vocabulary entry, then create flashcard
async function createVocabularyAndFlashcard(
  episodeId: string,
  word: string,
  definition: any
): Promise<string | null> {
  try {
    // Step 1: Check if vocabulary already exists
    const { data: existingVocab, error: searchError } = await supabase
      .from('vocabulary')
      .select('id')
      .eq('japanese_text', word)
      .single();

    let vocabId: string;

    if (existingVocab && existingVocab.id) {
      // Vocabulary already exists, use it
      vocabId = existingVocab.id;
      console.log('Using existing vocabulary:', word, vocabId);
    } else {
      // Step 2: Create new vocabulary entry in master table
      const { data: newVocab, error: vocabError } = await supabase
        .from('vocabulary')
        .insert({
          japanese: word,
          english: definition.meaning,
          furigana: definition.furigana,
          parts_of_speech: definition.partOfSpeech,
        })
        .select('id')
        .single();

      if (vocabError || !newVocab?.id) {
        console.error('Error creating vocabulary:', vocabError);
        return null;
      }

      vocabId = newVocab.id;
      console.log('Created new vocabulary:', word, vocabId);
    }

    // Step 3: Create flashcard that references the vocabulary
    const { data: flashcard, error: flashcardError } = await supabase
      .from('flashcards')
      .insert({
        episode_id: episodeId,
        vocab_id: vocabId,
        japanese_text: word,
        english_translation: definition.meaning,
        furigana: definition.furigana,
        part_of_speech: definition.partOfSpeech,
      })
      .select('id')
      .single();

    if (flashcardError) {
      console.error('Error creating flashcard:', flashcardError);
      return null;
    }

    console.log('Created flashcard:', flashcard?.id, 'for episode:', episodeId);
    return flashcard?.id || null;
  } catch (error) {
    console.error('Error in createVocabularyAndFlashcard:', error);
    return null;
  }
}

export async function createFlashcard(
  episodeId: string,
  word: string,
  definition: any
): Promise<string | null> {
  return createVocabularyAndFlashcard(episodeId, word, definition);
}

// Generate flashcards for multiple words
export async function generateFlashcardsForEpisode(
  episodeId: string,
  vocabulary: string[],
  openaiKey?: string
): Promise<{ success: boolean; cardCount: number; cardIds: string[] }> {
  const cardIds: string[] = [];
  let created = 0;

  try {
    // First, delete existing flashcards for this episode to avoid duplicates
    const { error: deleteError } = await supabase
      .from('flashcards')
      .delete()
      .eq('episode_id', episodeId);

    if (deleteError) {
      console.warn('Error deleting existing flashcards:', deleteError);
      // Continue anyway, might be first generation
    } else {
      console.log('Deleted existing flashcards for episode:', episodeId);
    }

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
  } catch (error) {
    console.error('Error in generateFlashcardsForEpisode:', error);
    return {
      success: false,
      cardCount: 0,
      cardIds: [],
    };
  }
}

// Create quiz questions from flashcards
export async function generateQuizForEpisode(
  episodeId: string,
  flashcardIds: string[],
  vocabularyMap?: Map<string, { contexts: string[]; frequency: number }>
): Promise<{ success: boolean; quizId: string | null }> {
  if (flashcardIds.length === 0) {
    return { success: false, quizId: null };
  }

  try {
    // Delete existing quizzes and their questions for this episode to avoid duplicates
    const { data: existingQuizzes, error: fetchError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('episode_id', episodeId);

    if (!fetchError && existingQuizzes && existingQuizzes.length > 0) {
      for (const quiz of existingQuizzes) {
        // Delete quiz questions
        await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', quiz.id);

        // Delete quiz
        await supabase
          .from('quizzes')
          .delete()
          .eq('id', quiz.id);
      }
      console.log(`Deleted ${existingQuizzes.length} existing quizzes for episode:`, episodeId);
    }

    // Fetch flashcard data to create questions
    const { data: cards, error: cardsError } = await supabase
      .from('flashcards')
      .select('id, japanese_text, english_translation, vocab_id, furigana, part_of_speech')
      .in('id', flashcardIds);

    if (cardsError || !cards) {
      console.error('Error fetching flashcards:', cardsError);
      return { success: false, quizId: null };
    }

    console.log('Fetched flashcards for quiz generation:', cards.length, 'cards');

    // Create Flashcard Review Quiz only
    const quizId = await createFlashcardReviewQuiz(episodeId, cards);

    return {
      success: quizId !== null,
      quizId,
    };
  } catch (error) {
    console.error('Error generating quizzes:', error);
    return { success: false, quizId: null };
  }
}

async function createFlashcardReviewQuiz(
  episodeId: string,
  cards: Array<{ id: string; japanese_text: string; english_translation: string; vocab_id?: string }>
): Promise<string | null> {
  try {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        episode_id: episodeId,
        title: `Flashcard Review`,
        quiz_type: 'flashcard_review',
        total_questions: cards.length,
      })
      .select('id')
      .single();

    if (quizError || !quiz?.id) {
      console.error('Error creating flashcard review quiz:', quizError);
      return null;
    }

    const quizId = quiz.id;
    let questionsCreated = 0;

    // Create flashcard review questions (just showing the word and its meaning)
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const { error: insertError } = await supabase.from('quiz_questions').insert({
        quiz_id: quizId,
        question_type: 'flashcard_review',
        question_text: card.japanese_text,
        correct_answer: card.english_translation,
        vocab_id: card.vocab_id,
      });

      if (insertError) {
        console.error(`Error inserting flashcard review question ${i}:`, insertError);
      } else {
        questionsCreated++;
      }
    }

    console.log(`Created flashcard review quiz: ${quizId} with ${questionsCreated}/${cards.length} questions`);
    return quizId;
  } catch (error) {
    console.error('Error in createFlashcardReviewQuiz:', error);
    return null;
  }
}


// Main function: Generate everything for an episode
export async function generateLearningMaterialsForEpisode(
  episodeId: string,
  vocabulary: string[],
  vocabularyMap?: Map<string, { contexts: string[]; frequency: number }>,
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

    // Step 2: Generate flashcard review quiz from flashcards
    const quizResult = await generateQuizForEpisode(
      episodeId,
      flashcardResult.cardIds,
      vocabularyMap // Pass context data
    );

    return {
      success: quizResult.success,
      flashcards: flashcardResult.cardCount,
      quizId: quizResult.quizId,
      message: `Created ${flashcardResult.cardCount} flashcards and 1 Flashcard Review quiz`,
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
