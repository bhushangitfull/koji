/**
 * Hook to generate flashcards and quizzes from subtitles
 */

import { useState } from 'react';
import { extractVocabularyFromSubtitle } from '@/utils/vocabularyExtractor';
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
      // Step 1: Extract vocabulary (10% progress)
      setState((s) => ({ ...s, progress: 10, status: 'Extracting vocabulary...' }));
      const vocabulary = extractVocabularyFromSubtitle(subtitleContent, subtitleFormat);

      if (vocabulary.length === 0) {
        setState({
          loading: false,
          progress: 0,
          status: '',
          error: 'No vocabulary found in subtitles',
          result: null,
        });
        return false;
      }

      setState((s) => ({
        ...s,
        progress: 20,
        status: `Found ${vocabulary.length} unique words. Generating flashcards...`,
      }));

      // Step 2: Generate flashcards and quiz (80% progress)
      const result = await generateLearningMaterialsForEpisode(
        episodeId,
        vocabulary.slice(0, 20), // Limit to top 20 words
        openaiKey
      );

      if (!result.success) {
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
      setState({
        loading: false,
        progress: 0,
        status: '',
        error: errorMessage,
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
