/**
 * Subtitle Parser & Vocabulary Extractor
 * Extracts vocabulary from SRT/VTT subtitle files
 */

// Parse SRT subtitle format
export function parseSRT(content: string): string[] {
  const lines = content.split('\n');
  const textLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines, timing lines, and sequence numbers
    if (
      line === '' ||
      line.match(/^\d+$/) ||
      line.includes('-->') ||
      line.match(/^\d{2}:\d{2}:\d{2}/)
    ) {
      continue;
    }

    // This is subtitle text
    textLines.push(line);
  }

  return textLines;
}

// Parse VTT subtitle format
export function parseVTT(content: string): string[] {
  const lines = content.split('\n');
  const textLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip header, empty lines, and timing lines
    if (
      line === '' ||
      line === 'WEBVTT' ||
      line.includes('-->') ||
      line.startsWith('NOTE') ||
      line.match(/^\d{2}:\d{2}:\d{2}/)
    ) {
      continue;
    }

    textLines.push(line);
  }

  return textLines;
}

// Check if character is Kanji only (not Hiragana or Katakana)
export function isKanji(char: string): boolean {
  const code = char.charCodeAt(0);
  // Kanji: 4E00-9FFF
  return code >= 0x4e00 && code <= 0x9fff;
}

// Check if character is Hiragana
export function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0);
  // Hiragana: 3040-309F
  return code >= 0x3040 && code <= 0x309f;
}

// Check if character is Katakana
export function isKatakana(char: string): boolean {
  const code = char.charCodeAt(0);
  // Katakana: 30A0-30FF
  return code >= 0x30a0 && code <= 0x30ff;
}

// Check if word contains at least one Kanji character
export function containsKanji(word: string): boolean {
  for (let i = 0; i < word.length; i++) {
    if (isKanji(word[i])) {
      return true;
    }
  }
  return false;
}

// Check if character is Japanese (Hiragana, Katakana, or Kanji)
export function isJapanese(char: string): boolean {
  const code = char.charCodeAt(0);
  
  // Hiragana: 3040-309F
  if (code >= 0x3040 && code <= 0x309f) return true;
  
  // Katakana: 30A0-30FF
  if (code >= 0x30a0 && code <= 0x30ff) return true;
  
  // Kanji: 4E00-9FFF
  if (code >= 0x4e00 && code <= 0x9fff) return true;
  
  return false;
}

// Extract words from Japanese text
export function extractJapaneseWords(text: string): string[] {
  const words: string[] = [];
  let currentWord = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (isJapanese(char)) {
      currentWord += char;
    } else {
      if (currentWord.length > 0) {
        words.push(currentWord);
        currentWord = '';
      }
    }
  }

  if (currentWord.length > 0) {
    words.push(currentWord);
  }

  return words;
}

// Extract Japanese words with their context sentences
export function extractJapaneseWordsWithContext(textLines: string[]): Map<string, string[]> {
  const wordContextMap = new Map<string, string[]>();

  for (const line of textLines) {
    const words = extractJapaneseWords(line);
    for (const word of words) {
      if (!wordContextMap.has(word)) {
        wordContextMap.set(word, []);
      }
      // Store sentence where this word appears
      const contexts = wordContextMap.get(word)!;
      if (!contexts.includes(line)) {
        contexts.push(line);
      }
    }
  }

  return wordContextMap;
}

// Remove duplicate words and sort by frequency
export function deduplicateAndSort(words: string[]): Array<{ word: string; count: number }> {
  const wordMap = new Map<string, number>();

  words.forEach((word) => {
    const count = wordMap.get(word) || 0;
    wordMap.set(word, count + 1);
  });

  return Array.from(wordMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count); // Sort by frequency (descending)
}

// Filter words: keep only Kanji words, remove common particles/verbs
export function filterCommonWords(words: Array<{ word: string; count: number }>): string[] {
  // Common stopwords in Japanese (mostly hiragana particles and auxiliary verbs)
  const commonWords = new Set([
    'は', 'を', 'に', 'が', 'で', 'から', 'まで', 'も', 'や', 'か',
    'の', 'や', 'って', 'ね', 'よ', 'な', 'ああ', 'あ', 'いい', 'い',
    'した', 'する', 'した', 'ある', 'いる', 'なる', 'いく', 'くる',
    'った', 'てる', 'てい', 'てし', 'ない', 'ぬ', 'だ', 'です',
  ]);

  return words
    .filter(({ word }) => {
      // Skip very short words (1 character is usually particles)
      if (word.length < 2) return false;

      // Skip common stopwords
      if (commonWords.has(word)) return false;

      // ONLY include words with Kanji characters
      if (!containsKanji(word)) return false;

      return true;
    })
    .map(({ word }) => word);
}

// Main function: Extract vocabulary with context from subtitle content
export function extractVocabularyFromSubtitle(subtitleText: string, format: 'srt' | 'vtt' = 'srt'): string[] {
  // Step 1: Parse subtitle format
  let textLines: string[] = [];
  if (format === 'srt') {
    textLines = parseSRT(subtitleText);
  } else if (format === 'vtt') {
    textLines = parseVTT(subtitleText);
  }

  // Step 2: Extract Japanese words from each line
  const allWords: string[] = [];
  textLines.forEach((line) => {
    const wordsInLine = extractJapaneseWords(line);
    allWords.push(...wordsInLine);
  });

  // Step 3: Deduplicate and count frequency
  const sortedByFrequency = deduplicateAndSort(allWords);

  // Step 4: Filter common words and Kanji only
  const filtered = filterCommonWords(sortedByFrequency);

  // Step 5: Return top N most frequent words
  return filtered.slice(0, 50); // Return top 50 words
}

// Enhanced extraction with context: returns word-context mapping
export function extractVocabularyWithContext(
  subtitleText: string,
  format: 'srt' | 'vtt' = 'srt'
): Map<string, { contexts: string[]; frequency: number }> {
  // Step 1: Parse subtitle format
  let textLines: string[] = [];
  if (format === 'srt') {
    textLines = parseSRT(subtitleText);
  } else if (format === 'vtt') {
    textLines = parseVTT(subtitleText);
  }

  // Step 2: Extract words with context
  const wordContextMap = extractJapaneseWordsWithContext(textLines);

  // Step 3: Extract all words and count frequency
  const allWords: string[] = [];
  textLines.forEach((line) => {
    const wordsInLine = extractJapaneseWords(line);
    allWords.push(...wordsInLine);
  });

  const sortedByFrequency = deduplicateAndSort(allWords);

  // Step 4: Filter common words and Kanji only
  const filtered = filterCommonWords(sortedByFrequency);

  // Step 5: Build result map with context and frequency
  const result = new Map<string, { contexts: string[]; frequency: number }>();
  
  for (const word of filtered.slice(0, 50)) {
    const contexts = wordContextMap.get(word) || [];
    const frequency = sortedByFrequency.find(w => w.word === word)?.count || 1;
    result.set(word, { contexts, frequency });
  }

  return result;
}

// Export types
export interface ExtractedVocabulary {
  word: string;
  frequency: number;
}
