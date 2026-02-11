import { useEffect, useState } from 'react';
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
