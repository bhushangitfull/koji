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

// Filter words (remove very short or very common words)
export function filterCommonWords(words: Array<{ word: string; count: number }>): string[] {
  // Common stopwords in Japanese
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

      return true;
    })
    .map(({ word }) => word);
}

// Main function: Extract vocabulary from subtitle content
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

  // Step 4: Filter common words
  const filtered = filterCommonWords(sortedByFrequency);

  // Step 5: Return top N most frequent words
  return filtered.slice(0, 50); // Return top 50 words
}

// Export types
export interface ExtractedVocabulary {
  word: string;
  frequency: number;
}
