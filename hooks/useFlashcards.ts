import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Flashcard } from '@/types/study';

export function useFlashcards(episodeId?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFlashcards() {
      try {
        if (!episodeId) {
          setFlashcards([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('flashcards')
          .select('*')
          .eq('episode_id', episodeId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;

        setFlashcards(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        setError(err as Error);
        setFlashcards([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFlashcards();
  }, [episodeId]);

  return { flashcards, loading, error };
}
