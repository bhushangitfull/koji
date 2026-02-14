import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { Episode } from '@/types/study';

export function useEpisodes() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEpisodes() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('episodes')
          .select('*')
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;

        setEpisodes(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setError(err as Error);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodes();
  }, []);

  return { episodes, loading, error };
}

export function useEpisodeWithProgress(episodeId?: string) {
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const [quizAvailable, setQuizAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEpisodeData() {
      try {
        if (!episodeId) {
          setEpisode(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        // Fetch episode
        const { data: episodeData, error: episodeError } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', episodeId)
          .single();

        if (episodeError) throw episodeError;
        setEpisode(episodeData);

        // Count flashcards
        const { count: flashcardsCount, error: fcError } = await supabase
          .from('flashcards')
          .select('id', { count: 'exact' })
          .eq('episode_id', episodeId);

        if (fcError) throw fcError;
        setFlashcardsCount(flashcardsCount || 0);

        // Check for quizzes
        const { count: quizCount, error: qError } = await supabase
          .from('quizzes')
          .select('id', { count: 'exact' })
          .eq('episode_id', episodeId);

        if (qError) throw qError;
        setQuizAvailable((quizCount || 0) > 0);

        setError(null);
      } catch (err) {
        console.error('Error fetching episode data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodeData();
  }, [episodeId]);

  return { episode, flashcardsCount, quizAvailable, loading, error };
}

export function useEpisodesWithCounts() {
  const [episodes, setEpisodes] = useState<(Episode & { flashcardsCount: number; quizzesCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    async function fetchEpisodesWithCounts() {
      try {
        setLoading(true);
        const { data: episodesData, error: episodeError } = await supabase
          .from('episodes')
          .select('*')
          .order('created_at', { ascending: true });

        if (episodeError) throw episodeError;

        if (!episodesData) {
          setEpisodes([]);
          setLoading(false);
          return;
        }

        // Fetch counts for all episodes
        const episodesWithCounts = await Promise.all(
          episodesData.map(async (episode) => {
            // Count flashcards
            const { count: flashcardsCount = 0, error: fcError } = await supabase
              .from('flashcards')
              .select('id', { count: 'exact', head: true })
              .eq('episode_id', episode.id);

            if (fcError) {
              console.error(`Error fetching flashcards count for ${episode.id}:`, fcError);
            }

            // Count quizzes
            const { count: quizzesCount = 0, error: qError } = await supabase
              .from('quizzes')
              .select('id', { count: 'exact', head: true })
              .eq('episode_id', episode.id);

            if (qError) {
              console.error(`Error fetching quizzes count for ${episode.id}:`, qError);
            }

            return {
              ...episode,
              flashcardsCount: flashcardsCount || 0,
              quizzesCount: quizzesCount || 0,
            };
          })
        );

        setEpisodes(episodesWithCounts);
        setError(null);
      } catch (err) {
        console.error('Error fetching episodes with counts:', err);
        setError(err as Error);
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEpisodesWithCounts();
  }, [refetchTrigger]);

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  return { episodes, loading, error, refetch };
}
