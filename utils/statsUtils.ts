/**
 * User Stats Tracking
 * Updates user_stats table after quiz completion, handles streaks and points
 */

import { supabase } from '@/utils/supabase';
import {
  recordUserActivity,
  updateUserTierIfNeeded,
  calculateStreakBonus,
} from '@/utils/streakUtils';

export interface UserStats {
  id: string;
  user_id: string;
  total_points: number;
  weekly_points: number;
  daily_streak: number;
  last_activity_date: string | null;
  rank_global: number;
  rank_weekly: number;
  created_at: string;
  updated_at: string;
}

/**
 * Calculate daily streak based on last activity date
 */
export function calculateDailyStreak(lastActivityDate: string | null, currentStreak: number): number {
  if (!lastActivityDate) {
    return 1; // First activity
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastDate = new Date(lastActivityDate);
  lastDate.setHours(0, 0, 0, 0);

  const todayTime = today.getTime();
  const yesterdayTime = yesterday.getTime();
  const lastDateTime = lastDate.getTime();

  if (lastDateTime === todayTime) {
    // Already did activity today, keep streak
    return currentStreak;
  } else if (lastDateTime === yesterdayTime) {
    // Did activity yesterday, increment streak
    return currentStreak + 1;
  } else {
    // Gap in activity, reset streak
    return 1;
  }
}

/**
 * Recalculate global rank based on total points
 */
export async function recalculateGlobalRank(userId: string, totalPoints: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_stats')
      .select('id', { count: 'exact' })
      .gt('total_points', totalPoints);

    if (error) {
      console.error('Error calculating global rank:', error);
      return 1;
    }

    return (count || 0) + 1;
  } catch (err) {
    console.error('Error in recalculateGlobalRank:', err);
    return 1;
  }
}

/**
 * Recalculate weekly rank based on weekly points
 * (Users with higher weekly_points in the current week)
 */
export async function recalculateWeeklyRank(userId: string, weeklyPoints: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('user_stats')
      .select('id', { count: 'exact' })
      .gt('weekly_points', weeklyPoints);

    if (error) {
      console.error('Error calculating weekly rank:', error);
      return 1;
    }

    return (count || 0) + 1;
  } catch (err) {
    console.error('Error in recalculateWeeklyRank:', err);
    return 1;
  }
}

/**
 * Update user stats after quiz completion
 * Awards points, updates streaks, and recalculates ranks
 */
export async function updateUserStats(
  userId: string,
  options: {
    points?: number;
    quizScore?: number;
    totalQuestions?: number;
  } = {}
): Promise<{ success: boolean; stats: UserStats | null; message: string }> {
  try {
    // Handle both old and new parameter formats for backwards compatibility
    const pointsAwarded = options.points || (options.quizScore ? options.quizScore * 10 : 0);

    console.log('[Stats] Updating for user:', userId, 'Points:', pointsAwarded);

    // Get current user stats
    let { data: currentStats, error: fetchError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user stats:', fetchError);
      return { success: false, stats: null, message: 'Failed to fetch user stats' };
    }

    // If no stats exist, create initial record
    if (!currentStats) {
      const { data: initialStats, error: createError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          total_points: pointsAwarded,
          weekly_points: pointsAwarded,
          daily_streak: 1,
          longest_streak: 1,
          last_activity_date: new Date().toISOString(),
          current_tier: 'Beginner',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating stats:', createError);
        return { success: false, stats: null, message: 'Failed to create stats' };
      }

      currentStats = initialStats;
    }

    // Calculate streak bonus
    const streakBonus = calculateStreakBonus(currentStats.daily_streak || 0);

    // Calculate total points to add (including bonus)
    const totalPointsToAdd = pointsAwarded + streakBonus;

    // Calculate new totals
    const totalPoints = (currentStats.total_points || 0) + totalPointsToAdd;
    const weeklyPoints = (currentStats.weekly_points || 0) + totalPointsToAdd;

    console.log(
      '[Stats] New totals - Total:',
      totalPoints,
      'Weekly:',
      weeklyPoints,
      'Streak:',
      currentStats.daily_streak
    );

    // Calculate new ranks
    const rankGlobal = await recalculateGlobalRank(userId, totalPoints);
    const rankWeekly = await recalculateWeeklyRank(userId, weeklyPoints);

    console.log('[Stats] New ranks - Global:', rankGlobal, 'Weekly:', rankWeekly);

    // Upsert user stats
    const { data: updatedStats, error: updateError } = await supabase
      .from('user_stats')
      .update({
        total_points: totalPoints,
        weekly_points: weeklyPoints,
        rank_global: rankGlobal,
        rank_weekly: rankWeekly,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user stats:', updateError);
      return { success: false, stats: null, message: 'Failed to update user stats' };
    }

    // Record daily activity for streak tracking
    await recordUserActivity(userId, 'quiz', totalPointsToAdd);

    // Update tier if needed
    await updateUserTierIfNeeded(userId, totalPoints);

    console.log('[Stats] Successfully updated user stats');

    return {
      success: true,
      stats: updatedStats,
      message: `Earned ${totalPointsToAdd} points! ${streakBonus > 0 ? `(+${streakBonus} streak bonus)` : ''}`,
    };
  } catch (error) {
    console.error('Error in updateUserStats:', error);
    return { success: false, stats: null, message: 'Error updating stats' };
  }
}

/**
 * Record quiz attempt in user_quiz_attempts table
 */
export async function recordQuizAttempt(
  userId: string,
  quizId: string,
  correctCount: number,
  totalQuestions: number
): Promise<{ success: boolean; message: string }> {
  try {
    const percentageCorrect = (correctCount / totalQuestions) * 100;
    const score = correctCount * 10; // Points

    console.log('[Quiz Attempt] Recording for user:', userId, 'Quiz:', quizId, 'Score:', score);

    const { error } = await supabase.from('user_quiz_attempts').insert({
      user_id: userId,
      quiz_id: quizId,
      score: correctCount,
      total_questions: totalQuestions,
      percentage_correct: Math.round(percentageCorrect),
      points_earned: score,
      attempted_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error recording quiz attempt:', error);
      return { success: false, message: 'Failed to record quiz attempt' };
    }

    console.log('[Quiz Attempt] Successfully recorded');
    return { success: true, message: 'Quiz attempt recorded' };
  } catch (error) {
    console.error('Error in recordQuizAttempt:', error);
    return { success: false, message: 'Error recording attempt' };
  }
}

/**
 * Fetch user stats for display
 */
export async function fetchUserStats(userId: string): Promise<UserStats | null> {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error in fetchUserStats:', error);
    return null;
  }
}

/**
 * Get user progress stats (words learned, episodes watched, etc.)
 */
export async function fetchUserProgress(userId: string): Promise<{
  wordsLearned: number;
  episodesWatched: number;
  quizzesCompleted: number;
} | null> {
  try {
    // Count unique flashcards accessible to user (via episodes)
    const { count: wordsLearned, error: wordsError } = await supabase
      .from('flashcards')
      .select('id', { count: 'exact' });

    // Count episodes with flashcards
    const { data: episodeData, error: episodesError } = await supabase
      .from('episodes')
      .select('id', { count: 'exact' });

    // Count quiz attempts by user
    const { count: quizzesCompleted, error: quizzesError } = await supabase
      .from('user_quiz_attempts')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (wordsError || episodesError || quizzesError) {
      console.error('Error fetching user progress:', { wordsError, episodesError, quizzesError });
      return null;
    }

    return {
      wordsLearned: wordsLearned || 0,
      episodesWatched: (episodeData as any)?.count || 0,
      quizzesCompleted: quizzesCompleted || 0,
    };
  } catch (error) {
    console.error('Error in fetchUserProgress:', error);
    return null;
  }
}
