import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { FlashcardProgressRecord } from '@/types/study';

export function useFlashcardProgress(userId?: string) {
  const [progress, setProgress] = useState<Map<string, FlashcardProgressRecord>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        if (!userId) {
          setProgress(new Map());
          setLoading(false);
          return;
        }

        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', userId);

        if (fetchError) throw fetchError;

        const progressMap = new Map<string, FlashcardProgressRecord>();
        (data || []).forEach((record) => {
          progressMap.set(record.flashcard_id, record);
        });

        setProgress(progressMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching flashcard progress:', err);
        setError(err as Error);
        setProgress(new Map());
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [userId]);

  const recordFlashcardReview = async (
    flashcardId: string,
    isCorrect: boolean,
    userId: string
  ): Promise<boolean> => {
    try {
      const existing = progress.get(flashcardId);

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_flashcard_progress')
          .update({
            times_correct: isCorrect ? existing.times_correct + 1 : existing.times_correct,
            times_incorrect: !isCorrect ? existing.times_incorrect + 1 : existing.times_incorrect,
            accuracy_percentage: calculateAccuracy(
              isCorrect ? existing.times_correct + 1 : existing.times_correct,
              isCorrect ? existing.times_incorrect : existing.times_incorrect + 1
            ),
            last_reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: userId,
            flashcard_id: flashcardId,
            times_correct: isCorrect ? 1 : 0,
            times_incorrect: isCorrect ? 0 : 1,
            accuracy_percentage: isCorrect ? 100 : 0,
            last_reviewed_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      return true;
    } catch (err) {
      console.error('Error recording flashcard review:', err);
      return false;
    }
  };

  return { progress, loading, error, recordFlashcardReview };
}

function calculateAccuracy(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
