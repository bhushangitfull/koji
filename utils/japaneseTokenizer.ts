/**
 * FINAL OPTIMIZED Japanese Word Tokenizer
 * 
 * Handles:
 * - Compound words: 恐れ知らず (fear + without knowing)
 * - Kanji + okurigana: 助けて (help)
 * - Katakana words: デク, オールマイト
 * - Hiragana words: ごめんね, ありがとう
 * - Particles: は, が, を, の (not tappable)
 */

export interface Token {
  text: string;
  type: 'word' | 'particle' | 'punctuation';
  isWord: boolean;
}

export interface TappableSegment {
  text: string;
  isTappable: boolean;
  lookupWord: string;
}

// ============================================================================
// CHARACTER TYPE DETECTION
// ============================================================================

function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x4e00 && code <= 0x9fff;
}

function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x3040 && code <= 0x309f;
}

function isKatakana(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x30a0 && code <= 0x30ff;
}

function isJapanese(char: string): boolean {
  return isKanji(char) || isHiragana(char) || isKatakana(char);
}

// ============================================================================
// PARTICLE DETECTION
// ============================================================================

const PARTICLES_SINGLE = new Set([
  'は', 'が', 'を', 'に', 'へ', 'と', 'で', 'や', 'か', 'の', 'も', 
  'ね', 'よ', 'わ', 'さ', 'な', 'ぞ', 'ぜ', 'っ'
]);

const PARTICLES_MULTI = new Set([
  'から', 'まで', 'より', 'ばかり', 'だけ', 'ほど', 'など', 'なんて',
  'けど', 'けれど', 'のに', 'ので', 'ながら', 'たり',
  'です', 'ます', 'でした', 'ました', 'ません',
]);

const GRAMMAR_SUFFIXES = new Set([
  'くれる', 'あげる', 'もらう', // giving/receiving verbs
  'ている', 'ていた', 'てる', 'てた', // progressive
  'でしょう', 'だろう', // probably
]);

// ============================================================================
// HIRAGANA WORDS (words that are written only in hiragana)
// ============================================================================

const HIRAGANA_WORDS = new Set([
  // Apologies
  'ごめん', 'ごめんね', 'ごめんなさい', 'すまない', 'すみません',
  
  // Thanks
  'ありがとう', 'ありがとうございます', 'どうも',
  
  // Greetings
  'おはよう', 'こんにちは', 'こんばんは', 'さようなら', 'またね', 'じゃあね', 'じゃあ',
  
  // Common verbs
  'ある', 'いる', 'する', 'くる', 'なる', 'みる', 'きく', 'いく', 'かく',
  'のむ', 'よむ', 'かう', 'あげる', 'くれる', 'もらう', 'できる', 'わかる',
  'しる', 'おもう', 'いう', 'はなす', 'かえる', 'でる', 'はいる', 'もつ',
  'たべる', 'ねる', 'おきる', 'みせる', 'おしえる',
  
  // Adjectives
  'おおきい', 'ちいさい', 'あたらしい', 'ふるい', 'いい', 'わるい',
  'たかい', 'やすい', 'あつい', 'さむい', 'あかるい', 'くらい',
  'おもしろい', 'つまらない', 'むずかしい', 'やさしい',
  
  // Question words
  'なに', 'なん', 'だれ', 'どこ', 'いつ', 'どう', 'なぜ', 'どれ', 'どの', 'どっち',
  
  // Pronouns
  'わたし', 'ぼく', 'おれ', 'あなた', 'かれ', 'かのじょ',
  'これ', 'それ', 'あれ', 'どれ',
  
  // Common nouns
  'ひと', 'もの', 'こと', 'とき', 'ところ',
  
  // Responses
  'はい', 'いいえ', 'ええ', 'うん', 'ううん', 'そう', 'ちがう',
  'だめ', 'いや', 'やだ',
  
  // Quantity/frequency
  'もっと', 'ちょっと', 'すこし', 'たくさん', 'ぜんぶ', 'みんな',
  'いつも', 'ときどき', 'よく', 'あまり', 'ぜんぜん',
  
  // Other common
  'ほら', 'ねえ', 'あの', 'その', 'この', 'まあ', 'やっぱり', 'やはり',
]);

// ============================================================================
// CONJUGATION STRIPPING
// ============================================================================

const CONJUGATION_ENDINGS = [
  'ます', 'ました', 'ません', 'ませんでした',
  'です', 'でした',
  'ている', 'てる', 'ていた', 'てた', 'て', 'で',
  'た', 'だ', 'ない', 'なかった',
  'れる', 'られる', 'せる', 'させる',
  'よう', 'ろう',
];

function stripConjugations(word: string): string {
  if (!word || word.length <= 1) return word;

  let cleaned = word;
  const sorted = [...CONJUGATION_ENDINGS].sort((a, b) => b.length - a.length);
  
  for (const ending of sorted) {
    if (cleaned.endsWith(ending) && cleaned.length > ending.length + 1) {
      return cleaned.slice(0, -ending.length);
    }
  }

  return cleaned;
}

// ============================================================================
// MAIN TOKENIZER
// ============================================================================

export function tokenizeJapanese(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    // Skip whitespace
    if (char === ' ' || char === '\u3000') {
      i++;
      continue;
    }

    // Handle non-Japanese (punctuation, numbers, etc.)
    if (!isJapanese(char)) {
      tokens.push({ text: char, type: 'punctuation', isWord: false });
      i++;
      continue;
    }

    // ==================================================================
    // KANJI WORDS
    // ==================================================================
    if (isKanji(char)) {
      let word = '';
      
      // Consume entire kanji+hiragana sequence
      while (i < text.length) {
        const c = text[i];
        
        if (isKanji(c)) {
          word += c;
          i++;
        } else if (isHiragana(c)) {
          word += c;
          i++;
          
          // Look ahead: if next is also kanji, keep going (compound word)
          // Otherwise, check if we should stop
          if (i < text.length) {
            const next = text[i];
            if (!isKanji(next)) {
              // Not a compound - check if we should stop here
              const lastChar = word[word.length - 1];
              
              // Stop if last char is a particle
              if (PARTICLES_SINGLE.has(lastChar)) {
                word = word.slice(0, -1);
                i--;
                break;
              }
              
              // Stop if we've collected enough for a word
              if (word.length >= 2) {
                break;
              }
            }
          }
        } else {
          break;
        }
      }
      
      if (word) {
        tokens.push({ text: word, type: 'word', isWord: true });
      }
      continue;
    }

    // ==================================================================
    // KATAKANA WORDS
    // ==================================================================
    if (isKatakana(char)) {
      let word = '';
      while (i < text.length && isKatakana(text[i])) {
        word += text[i];
        i++;
      }
      tokens.push({ text: word, type: 'word', isWord: true });
      continue;
    }

    // ==================================================================
    // HIRAGANA (could be word or particle)
    // ==================================================================
    if (isHiragana(char)) {
      let word = '';
      const startIdx = i;
      
      // Collect hiragana sequence
      while (i < text.length && isHiragana(text[i])) {
        word += text[i];
        i++;
        
        // Don't collect too much
        if (word.length >= 8) break;
        
        // Check if we've hit a known particle
        if (PARTICLES_MULTI.has(word)) break;
      }
      
      // Classify: word or particle?
      let isWord = false;
      
      if (PARTICLES_SINGLE.has(word) || PARTICLES_MULTI.has(word)) {
        isWord = false; // Particle
      } else if (GRAMMAR_SUFFIXES.has(word)) {
        isWord = false; // Grammar
      } else if (HIRAGANA_WORDS.has(word)) {
        isWord = true; // Known word
      } else if (word.length >= 3) {
        isWord = true; // Long enough to be a word
      } else {
        isWord = false; // Short, unknown = probably grammar
      }
      
      tokens.push({
        text: word,
        type: isWord ? 'word' : 'particle',
        isWord,
      });
      continue;
    }

    // Fallback
    i++;
  }

  return tokens;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function extractVocabulary(text: string): string[] {
  const tokens = tokenizeJapanese(text);
  const vocab: string[] = [];

  for (const token of tokens) {
    if (!token.isWord) continue;

    const cleaned = stripConjugations(token.text);
    vocab.push(cleaned);
    
    if (cleaned !== token.text) {
      vocab.push(token.text);
    }
  }

  return [...new Set(vocab)];
}

export function getWordAtPosition(text: string, tappedWord: string): string {
  const japanese = tappedWord.replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '');
  if (!japanese) return tappedWord;

  return stripConjugations(japanese) || japanese;
}

export function createTappableSegments(text: string): TappableSegment[] {
  const tokens = tokenizeJapanese(text);
  
  return tokens.map(token => ({
    text: token.text,
    isTappable: token.isWord,
    lookupWord: token.isWord ? (stripConjugations(token.text) || token.text) : token.text,
  }));
}

// ============================================================================
// TEST FUNCTION
// ============================================================================

export function testTokenizer() {
  const tests = [
    '恐れ知らずの笑顔で助けてくれる',
    '(母)((ごめんね 出久！ごめんね… ごめんね。',
    '私は日本語を勉強しています',
    'デクは何をしてるんだ？',
  ];

  console.log('=== Final Tokenizer Test ===\n');
  
  tests.forEach(text => {
    console.log(`Input: "${text}"`);
    const tokens = tokenizeJapanese(text);
    const words = tokens.filter(t => t.isWord);
    console.log(`Words (${words.length}):`, words.map(t => t.text).join(', '));
    console.log('');
  });
}