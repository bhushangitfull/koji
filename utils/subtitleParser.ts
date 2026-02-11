/**
 * IMPROVED Subtitle Parser with Better Japanese Support
 * Parse SRT, VTT, and ASS subtitle files
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
  try {
    const parts = timeStr.split(':');
    if (parts.length !== 3) {
      console.error(`[timeStringToMs] Invalid time format: ${timeStr}`);
      return 0;
    }
    
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const secondsAndMs = parts[2].split('.');
    const seconds = parseInt(secondsAndMs[0], 10) || 0;
    const ms = parseInt((secondsAndMs[1] || '0').padEnd(3, '0'), 10) || 0;

    return hours * 3600000 + minutes * 60000 + seconds * 1000 + ms;
  } catch (error) {
    console.error(`[timeStringToMs] Error parsing time: ${timeStr}`, error);
    return 0;
  }
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
 * IMPROVED SRT Parser with Better Japanese Handling
 */
function parseSRT(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  
  // Normalize line endings and remove BOM
  const normalizedContent = content
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/\r\n/g, '\n')  // Normalize to Unix line endings
    .replace(/\r/g, '\n');   // Handle old Mac line endings
  
  // Split by double newlines (blank lines separate subtitle blocks)
  const blocks = normalizedContent
    .split(/\n\s*\n/)
    .filter((block) => block.trim());

  console.log(`[SRT Parser] Found ${blocks.length} subtitle blocks`);

  blocks.forEach((block, blockIndex) => {
    try {
      const lines = block.trim().split('\n');
      
      // Find the timing line (contains -->)
      let timingLineIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timingLineIndex = i;
          break;
        }
      }

      if (timingLineIndex === -1) {
        return; // Skip this block
      }

      const timingLine = lines[timingLineIndex];
      const [startTimeStr, endTimeStr] = timingLine.split('-->').map((t) => t.trim());

      // Convert comma to dot for milliseconds (SRT uses comma)
      const startTimeFormatted = startTimeStr.replace(',', '.');
      const endTimeFormatted = endTimeStr.replace(',', '.');

      // Get text content - everything after the timing line
      const textLines = lines.slice(timingLineIndex + 1);
      
      // Clean and join text
      let text = textLines
        .filter(line => line.trim()) // Remove empty lines
        .join('\n')
        .trim();

      // Clean up common subtitle artifacts
      text = text
        .replace(/\[\[/g, '(') // Replace [[ with (
        .replace(/\]\]/g, ')') // Replace ]] with )
        .replace(/\(([ﾊﾟｿｺﾝ])\)/g, '') // Remove (パソコン) style notes
        .replace(/（([^）]*)）/g, '') // Remove full-width parenthetical notes
        .trim();

      if (!text) {
        return; // Skip empty subtitles
      }

      // Parse times
      const startMs = timeStringToMs(startTimeFormatted);
      const endMs = timeStringToMs(endTimeFormatted);

      if (isNaN(startMs) || isNaN(endMs) || startMs < 0 || endMs < 0) {
        console.warn(`[SRT] Invalid time in block ${blockIndex + 1}: ${startTimeFormatted} --> ${endTimeFormatted}`);
        return;
      }

      // Debug log for Japanese content
      const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
      if (hasJapanese && blockIndex < 5) {
        console.log(`[SRT] Japanese subtitle #${blockIndex + 1}: "${text.substring(0, 60)}" (${startMs}ms - ${endMs}ms)`);
      }

      subtitles.push({
        index: blockIndex + 1,
        startTime: startMs,
        endTime: endMs,
        text,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted,
      });
    } catch (error) {
      console.error(`[SRT] Error parsing block ${blockIndex + 1}:`, error);
    }
  });

  console.log(`[SRT Parser] Successfully parsed ${subtitles.length} subtitles`);
  if (subtitles.length > 0) {
    console.log(`[SRT Parser] Time range: ${subtitles[0].startTime}ms to ${subtitles[subtitles.length - 1].endTime}ms`);
  }
  
  return subtitles;
}

/**
 * Parse ASS/SSA format subtitles
 */
function parseASS(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const lines = content.split('\n');

  let inEventsSection = false;
  let subtitleIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '[Events]') {
      inEventsSection = true;
      continue;
    }

    if (line.startsWith('[') && line.endsWith(']') && inEventsSection) {
      break;
    }

    if (inEventsSection && line.startsWith('Dialogue:')) {
      try {
        const dialogueData = line.substring(9);
        const parts = dialogueData.split(',');

        if (parts.length < 10) continue;

        const startTimeStr = parts[1].trim();
        const endTimeStr = parts[2].trim();
        const text = parts.slice(9).join(',').trim();

        // Remove ASS styling tags
        const cleanText = text.replace(/\{[^}]*\}/g, '').trim();

        if (!cleanText) continue;

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
        console.warn('Failed to parse ASS line:', err);
      }
    }
  }

  console.log(`[ASS Parser] Parsed ${subtitles.length} subtitles`);
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
 */
function parseVTT(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const lines = content.split('\n');

  let i = 0;
  let subtitleIndex = 0;

  // Skip WEBVTT header
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }

  while (i < lines.length) {
    const line = lines[i].trim();

    if (line.includes('-->')) {
      const [startTimeStr, endTimeStr] = line.split('-->').map((t) => t.trim());

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

  console.log(`[VTT Parser] Parsed ${subtitles.length} subtitles`);
  return subtitles;
}

/**
 * Main parse function - detects format and parses
 */
export function parseSubtitles(content: string): ParsedSubtitles {
  console.log('[parseSubtitles] Starting parse, content length:', content.length);
  
  let format: 'srt' | 'vtt' | 'ass';
  let subtitles: Subtitle[];

  if (content.includes('[Events]')) {
    format = 'ass';
    console.log('[parseSubtitles] Detected ASS format');
    subtitles = parseASS(content);
  } else if (content.toUpperCase().includes('WEBVTT')) {
    format = 'vtt';
    console.log('[parseSubtitles] Detected VTT format');
    subtitles = parseVTT(content);
  } else {
    format = 'srt';
    console.log('[parseSubtitles] Detected SRT format (default)');
    subtitles = parseSRT(content);
  }

  console.log(`[parseSubtitles] Parsed ${subtitles.length} subtitles in ${format.toUpperCase()} format`);
  
  return {
    format,
    subtitles,
    rawText: content,
  };
}

/**
 * IMPROVED: Get subtitle at current timestamp with tolerance
 */
export function getSubtitleAtTime(subtitles: Subtitle[], timeMs: number): Subtitle | null {
  if (!subtitles || !Array.isArray(subtitles) || subtitles.length === 0) {
    return null;
  }

  // Add small tolerance (100ms) for subtitle matching
  const tolerance = 100;
  
  // Find subtitle that matches current time
  const subtitle = subtitles.find((sub) => {
    const start = Number(sub.startTime);
    const end = Number(sub.endTime);
    
    // Check if time falls within subtitle range (with tolerance)
    return timeMs >= (start - tolerance) && timeMs <= (end + tolerance);
  });

  return subtitle || null;
}

/**
 * Extract all Japanese words from subtitle text
 */
export function extractJapaneseWords(text: string): string[] {
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  const matches = text.match(japaneseRegex) || [];
  return [...new Set(matches)];
}