/**
 * Hook to generate flashcards and quizzes from subtitles
 */

import { useState } from 'react';
import { extractVocabularyFromSubtitle, extractVocabularyWithContext } from '@/utils/vocabularyExtractor';
import { generateLearningMaterialsForEpisode } from '@/utils/flashcardGenerator';

export interface GenerationState {
  loading: boolean;
  progress: number; // 0-100
  status: string;
  error: string | null;
  result: {
    flashcards: number;
    quizId: string | null;
  } | null;
}

export function useFlashcardGeneration() {
  const [state, setState] = useState<GenerationState>({
    loading: false,
    progress: 0,
    status: '',
    error: null,
    result: null,
  });

  const generateFromSubtitle = async (
    episodeId: string,
    subtitleContent: string,
    subtitleFormat: 'srt' | 'vtt' = 'srt',
    openaiKey?: string
  ) => {
    setState({
      loading: true,
      progress: 0,
      status: 'Extracting vocabulary from subtitles...',
      error: null,
      result: null,
    });

    try {
      // Step 1: Extract vocabulary with context (10% progress)
      setState((s) => ({ ...s, progress: 10, status: 'Extracting vocabulary...' }));
      const vocabularyMap = extractVocabularyWithContext(subtitleContent, subtitleFormat);
      const vocabulary = Array.from(vocabularyMap.keys());
      console.log('[Flashcard Generation] Extracted vocabulary:', vocabulary.length, 'words (Kanji only)');

      if (vocabulary.length === 0) {
        const error = 'No Kanji vocabulary found in subtitles';
        console.error('[Flashcard Generation] Error:', error);
        setState({
          loading: false,
          progress: 0,
          status: '',
          error,
          result: null,
        });
        return false;
      }

      setState((s) => ({
        ...s,
        progress: 20,
        status: `Found ${vocabulary.length} unique Kanji words. Generating flashcards...`,
      }));

      // Step 2: Generate flashcards and quiz (80% progress)
      console.log('[Flashcard Generation] Starting generation for episode:', episodeId);
      const result = await generateLearningMaterialsForEpisode(
        episodeId,
        vocabulary.slice(0, 20), // Limit to top 20 words
        vocabularyMap, // Pass context data
        openaiKey
      );

      console.log('[Flashcard Generation] Generation result:', result);

      if (!result.success) {
        console.error('[Flashcard Generation] Generation failed:', result.message);
        setState({
          loading: false,
          progress: 0,
          status: '',
          error: result.message,
          result: null,
        });
        return false;
      }

      // Success! (100% progress)
      console.log('[Flashcard Generation] Success! Created', result.flashcards, 'flashcards');
      setState({
        loading: false,
        progress: 100,
        status: 'Complete!',
        error: null,
        result: {
          flashcards: result.flashcards,
          quizId: result.quizId,
        },
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Flashcard Generation] Exception:', errorMessage, error);
      setState({
        loading: false,
        progress: 0,
        status: '',
        error: `Error: ${errorMessage}`,
        result: null,
      });
      return false;
    }
  };

  const reset = () => {
    setState({
      loading: false,
      progress: 0,
      status: '',
      error: null,
      result: null,
    });
  };

  return {
    ...state,
    generateFromSubtitle,
    reset,
  };
}
