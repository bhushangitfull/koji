import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { Quiz, QuizQuestion } from '@/types/study';

export function useQuizzes(episodeId?: string) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => {
    setRefetchKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        if (!episodeId) {
          setQuizzes([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('episode_id', episodeId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;

        setQuizzes(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err as Error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [episodeId, refetchKey]);

  return { quizzes, loading, error, refetch };
}

export function useQuizQuestions(quizId?: string) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        if (!quizId) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;

        setQuestions(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching quiz questions:', err);
        setError(err as Error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [quizId]);

  return { questions, loading, error };
}
