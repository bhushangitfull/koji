/**
 * Parse SRT and VTT subtitle files
 */

export interface Subtitle {
  index: number;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  text: string;
  startTimeStr: string;
  endTimeStr: string;
}

export interface ParsedSubtitles {
  format: 'srt' | 'vtt' | 'ass';
  subtitles: Subtitle[];
  rawText: string;
}

/**
 * Convert time string "00:00:05.000" to milliseconds
 */
function timeStringToMs(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const secondsAndMs = parts[2].split('.');
  const seconds = parseInt(secondsAndMs[0], 10);
  const ms = parseInt((secondsAndMs[1] || '0').padEnd(3, '0'), 10);

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + ms;
}

/**
 * Convert milliseconds to time string "00:00:05.000"
 */
function msToTimeString(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const msRemainder = ms % 1000;

  return (
    `${hours.toString().padStart(2, '0')}:` +
    `${minutes.toString().padStart(2, '0')}:` +
    `${seconds.toString().padStart(2, '0')}.` +
    `${msRemainder.toString().padStart(3, '0')}`
  );
}

/**
 * Parse SRT format subtitles
 * Format:
 * 1
 * 00:00:05,000 --> 00:00:10,000
 * Subtitle text here
 */
function parseSRT(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const blocks = content.split('\n\n').filter((block) => block.trim());

  blocks.forEach((block, blockIndex) => {
    const lines = block.trim().split('\n');

    // Find the timing line (contains -->)
    let timingLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timingLineIndex = i;
        break;
      }
    }

    if (timingLineIndex === -1) return;

    const timingLine = lines[timingLineIndex];
    const [startTimeStr, endTimeStr] = timingLine.split('-->').map((t) => t.trim());

    // Convert comma to dot for milliseconds
    const startTimeFormatted = startTimeStr.replace(',', '.');
    const endTimeFormatted = endTimeStr.replace(',', '.');

    // Get text content and preserve it without aggressive trimming
    const textLines = lines.slice(timingLineIndex + 1);
    const text = textLines.join('\n').trim();

    // Log if Japanese characters detected for debugging
    if (text && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)) {
      console.log(`[SRT] Japanese subtitle detected at index ${blockIndex + 1}: ${text.substring(0, 50)}`);
    }

    if (text) {
      subtitles.push({
        index: blockIndex + 1,
        startTime: timeStringToMs(startTimeFormatted),
        endTime: timeStringToMs(endTimeFormatted),
        text,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted,
      });
    }
  });

  console.log(`[SRT Parser] Parsed ${subtitles.length} subtitles total`);
  return subtitles;
}

/**
 * Parse ASS/SSA format subtitles
 * Format (ASS/SSA):
 * [Events]
 * Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
 * Dialogue: 0,0:00:05.00,0:00:10.00,Default,,0,0,0,,Japanese text here
 * Time format: H:MM:SS.CC (centiseconds)
 */
function parseASS(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const lines = content.split('\n');

  let inEventsSection = false;
  let subtitleIndex = 0;

  // Find Events section and parse
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '[Events]') {
      inEventsSection = true;
      continue;
    }

    // Stop if we hit another section
    if (line.startsWith('[') && line.endsWith(']') && inEventsSection) {
      break;
    }

    // Parse Dialogue lines
    if (inEventsSection && line.startsWith('Dialogue:')) {
      try {
        // Remove 'Dialogue: ' prefix
        const dialogueData = line.substring(9);

        // Split by comma, but be careful because Text field can contain commas
        // Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
        const parts = dialogueData.split(',');

        if (parts.length < 10) continue;

        const startTimeStr = parts[1].trim();
        const endTimeStr = parts[2].trim();
        const text = parts.slice(9).join(',').trim(); // Text field is after Effect

        // Remove ASS styling tags (like {\an8}, {\c&H...&})
        const cleanText = text.replace(/\{[^}]*\}/g, '').trim();

        if (!cleanText) continue;

        // Log if Japanese characters detected for debugging
        if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(cleanText)) {
          console.log(`[ASS] Japanese subtitle detected at index ${subtitleIndex + 1}: ${cleanText.substring(0, 50)}`);
        }

        // Convert ASS time format (H:MM:SS.CC) to milliseconds
        const startMs = assTimeToMs(startTimeStr);
        const endMs = assTimeToMs(endTimeStr);

        subtitleIndex++;
        subtitles.push({
          index: subtitleIndex,
          startTime: startMs,
          endTime: endMs,
          text: cleanText,
          startTimeStr,
          endTimeStr,
        });
      } catch (err) {
        console.warn('Failed to parse ASS line:', line, err);
      }
    }
  }

  console.log(`[ASS Parser] Parsed ${subtitles.length} subtitles total`);
  return subtitles;
}

/**
 * Convert ASS time format "0:00:05.00" to milliseconds
 */
function assTimeToMs(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length !== 3) return 0;

  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const secondsAndCs = parts[2].split('.');
  const seconds = parseInt(secondsAndCs[0], 10) || 0;
  const centiseconds = parseInt((secondsAndCs[1] || '0').padEnd(2, '0'), 10) || 0;

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + centiseconds * 10;
}

/**
 * Parse VTT format subtitles
 * Format:
 * WEBVTT
 *
 * 00:00:05.000 --> 00:00:10.000
 * Subtitle text here
 */
function parseVTT(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const lines = content.split('\n');

  let i = 0;
  let subtitleIndex = 0;

  // Skip WEBVTT header and metadata
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.includes('-->')) {
      const [startTimeStr, endTimeStr] = line.split('-->').map((t) => t.trim());

      // Collect text lines
      const text: string[] = [];
      i++;

      while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
        text.push(lines[i].trim());
        i++;
      }

      if (text.length > 0) {
        const fullText = text.join('\n');
        
        // Log if Japanese characters detected for debugging
        if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(fullText)) {
          console.log(`[VTT] Japanese subtitle detected at index ${subtitleIndex + 1}: ${fullText.substring(0, 50)}`);
        }
        
        subtitleIndex++;
        subtitles.push({
          index: subtitleIndex,
          startTime: timeStringToMs(startTimeStr),
          endTime: timeStringToMs(endTimeStr),
          text: fullText,
          startTimeStr,
          endTimeStr,
        });
      }
    } else {
      i++;
    }
  }

  console.log(`[VTT Parser] Parsed ${subtitles.length} subtitles total`);
  return subtitles;
}

/**
 * Detect subtitle format and parse accordingly
 */
export function parseSubtitles(content: string): ParsedSubtitles {
  console.log('[parseSubtitles] Input content length:', content.length);
  console.log('[parseSubtitles] First 200 chars:', content.substring(0, 200));
  
  let format: 'srt' | 'vtt' | 'ass';
  let subtitles: Subtitle[];

  if (content.includes('[Events]')) {
    format = 'ass';
    console.log('[parseSubtitles] Detected ASS format');
    subtitles = parseASS(content);
  } else if (content.includes('WEBVTT')) {
    format = 'vtt';
    console.log('[parseSubtitles] Detected VTT format');
    subtitles = parseVTT(content);
  } else {
    format = 'srt';
    console.log('[parseSubtitles] Detected SRT format');
    subtitles = parseSRT(content);
  }

  console.log(`[parseSubtitles] Returning ${subtitles.length} subtitles in ${format} format`);
  return {
    format,
    subtitles,
    rawText: content,
  };
}

/**
 * Get subtitle at current timestamp
 */
export function getSubtitleAtTime(subtitles: Subtitle[], timeMs: number): Subtitle | null {
  if (!subtitles || !Array.isArray(subtitles)) return null;
  
  return subtitles.find((sub) => {
    // Force conversion to numbers just in case storage turned them into strings
    const start = Number(sub.startTime);
    const end = Number(sub.endTime);
    return timeMs >= start && timeMs <= end;
  }) || null;
}

/**
 * Extract all Japanese words from subtitle text
 * Simple regex-based extraction (not perfect, but functional)
 */
export function extractJapaneseWords(text: string): string[] {
  // Match Hiragana, Katakana, and Kanji
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  const matches = text.match(japaneseRegex) || [];
  return [...new Set(matches)]; // Remove duplicates
}
