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
  format: 'srt' | 'vtt';
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

    const text = lines.slice(timingLineIndex + 1).join('\n').trim();

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

  return subtitles;
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
        subtitleIndex++;
        subtitles.push({
          index: subtitleIndex,
          startTime: timeStringToMs(startTimeStr),
          endTime: timeStringToMs(endTimeStr),
          text: text.join('\n'),
          startTimeStr,
          endTimeStr,
        });
      }
    } else {
      i++;
    }
  }

  return subtitles;
}

/**
 * Detect subtitle format and parse accordingly
 */
export function parseSubtitles(content: string): ParsedSubtitles {
  const format = content.includes('WEBVTT') ? 'vtt' : 'srt';
  const subtitles = format === 'vtt' ? parseVTT(content) : parseSRT(content);

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
  return subtitles.find((sub) => timeMs >= sub.startTime && timeMs <= sub.endTime) || null;
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
