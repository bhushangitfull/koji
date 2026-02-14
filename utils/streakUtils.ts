/**
 * Streak & Points Management Utilities
 * Handles daily streaks, tier progression, and points tracking
 */

import { supabase } from '@/utils/supabase';

export interface UserTierRank {
  id: string;
  rank_name: string;
  min_points: number;
  max_points: number | null;
  badge_icon: string;
  badge_color: string;
  description: string;
}

/**
 * Check if user completed an activity today
 */
export async function checkUserActivityToday(
  userId: string,
  activityType?: string
): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = supabase
      .from('user_daily_activity')
      .select('id')
      .eq('user_id', userId)
      .gte('activity_date', today.toISOString().split('T')[0])
      .lte('activity_date', today.toISOString().split('T')[0]);

    if (activityType) {
      query = query.eq('activity_type', activityType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking activity:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('Error in checkUserActivityToday:', err);
    return false;
  }
}

/**
 * Record user activity and update streak
 */
export async function recordUserActivity(
  userId: string,
  activityType: 'quiz' | 'episode' | 'flashcard',
  pointsEarned: number = 0
): Promise<boolean> {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Get or create today's activity record
    const { data: existingActivity } = await supabase
      .from('user_daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', dateStr)
      .single();

    const updateData: any = {
      user_id: userId,
      activity_date: dateStr,
    };

    if (activityType === 'quiz') {
      updateData.quiz_completed = true;
    } else if (activityType === 'episode') {
      updateData.episode_completed = true;
    } else if (activityType === 'flashcard') {
      updateData.flashcard_reviewed = true;
    }

    // Determine combined activity type
    if (existingActivity) {
      const hasQuiz = existingActivity.quiz_completed || activityType === 'quiz';
      const hasEpisode = existingActivity.episode_completed || activityType === 'episode';
      const hasFlashcard = existingActivity.flashcard_reviewed || activityType === 'flashcard';

      updateData.activity_type = hasEpisode || hasQuiz ? 'combined' : activityType;
      updateData.points_earned = (existingActivity.points_earned || 0) + pointsEarned;
    } else {
      updateData.activity_type = activityType;
      updateData.points_earned = pointsEarned;
    }

    const { error } = await supabase
      .from('user_daily_activity')
      .upsert(updateData, { onConflict: 'user_id,activity_date' });

    if (error) {
      console.error('Error recording activity:', error);
      return false;
    }

    // Update streak
    await updateUserStreak(userId);
    return true;
  } catch (err) {
    console.error('Error in recordUserActivity:', err);
    return false;
  }
}

/**
 * Calculate and update user streak
 */
export async function updateUserStreak(userId: string): Promise<number> {
  try {
    // Get user's current stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('daily_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching stats:', statsError);
      return 1;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;
    let longestStreak = stats?.longest_streak || 1;

    if (stats?.last_activity_date) {
      const lastDate = new Date(stats.last_activity_date);
      lastDate.setHours(0, 0, 0, 0);

      const todayTime = today.getTime();
      const yesterdayTime = yesterday.getTime();
      const lastDateTime = lastDate.getTime();

      if (lastDateTime === todayTime) {
        // Already did activity today
        newStreak = stats.daily_streak || 1;
      } else if (lastDateTime === yesterdayTime) {
        // Did activity yesterday, continue streak
        newStreak = (stats.daily_streak || 1) + 1;
      } else {
        // Gap in activity, reset streak
        newStreak = 1;
      }
    }

    // Update longest streak if current exceeds it
    if (newStreak > longestStreak) {
      longestStreak = newStreak;
    }

    // Update user_stats
    const { error: updateError } = await supabase
      .from('user_stats')
      .update({
        daily_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating streak:', updateError);
      return 1;
    }

    console.log(`[Streak] Updated for user: ${userId}, New streak: ${newStreak}`);
    return newStreak;
  } catch (err) {
    console.error('Error in updateUserStreak:', err);
    return 1;
  }
}

/**
 * Get all tier ranks
 */
export async function getUserTierRanks(): Promise<UserTierRank[]> {
  try {
    const { data, error } = await supabase
      .from('user_tier_ranks')
      .select('*')
      .order('min_points', { ascending: true });

    if (error) {
      console.error('Error fetching tier ranks:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getUserTierRanks:', err);
    return [];
  }
}

/**
 * Calculate tier based on points
 */
export async function calculateUserTier(
  totalPoints: number
): Promise<{ tier: string; icon: string; color: string; nextTierPoints?: number }> {
  try {
    const tiers = await getUserTierRanks();

    if (tiers.length === 0) {
      return { tier: 'Beginner', icon: '🌱', color: '#A8E6CF', nextTierPoints: 100 };
    }

    let currentTier = tiers[0];
    let nextTier = tiers[1];

    for (let i = 0; i < tiers.length; i++) {
      if (totalPoints >= tiers[i].min_points) {
        currentTier = tiers[i];
        nextTier = tiers[i + 1];
      } else {
        break;
      }
    }

    return {
      tier: currentTier.rank_name,
      icon: currentTier.badge_icon,
      color: currentTier.badge_color,
      nextTierPoints: nextTier?.min_points,
    };
  } catch (err) {
    console.error('Error in calculateUserTier:', err);
    return { tier: 'Beginner', icon: '🌱', color: '#A8E6CF' };
  }
}

/**
 * Update user tier if points change
 */
export async function updateUserTierIfNeeded(userId: string, totalPoints: number): Promise<void> {
  try {
    const tierInfo = await calculateUserTier(totalPoints);

    const { error } = await supabase
      .from('user_stats')
      .update({
        current_tier: tierInfo.tier,
        tier_points_progress: ((totalPoints - 0) / (tierInfo.nextTierPoints || totalPoints + 1)) * 100,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating tier:', error);
      return;
    }

    console.log(`[Tier] Updated for user: ${userId}, New tier: ${tierInfo.tier}`);
  } catch (err) {
    console.error('Error in updateUserTierIfNeeded:', err);
  }
}

/**
 * Award streak bonus points
 */
export function calculateStreakBonus(streakDays: number): number {
  if (streakDays < 3) return 0;
  if (streakDays < 7) return 5; // 3-6 days
  if (streakDays < 14) return 10; // 7-13 days
  if (streakDays < 30) return 25; // 14-29 days
  return 50; // 30+ days
}

/**
 * Check if episode was fully watched
 */
export async function recordEpisodeWatched(
  userId: string,
  episodeId: string,
  totalDuration: number,
  watchedDuration: number
): Promise<boolean> {
  try {
    const isFullyWatched = watchedDuration >= totalDuration * 0.9; // 90% threshold

    const { error } = await supabase
      .from('user_episode_progress')
      .upsert(
        {
          user_id: userId,
          episode_id: episodeId,
          total_duration: totalDuration,
          watch_end_time: watchedDuration,
          is_fully_watched: isFullyWatched,
          completed_at: isFullyWatched ? new Date().toISOString() : null,
          watched_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,episode_id' }
      );

    if (error) {
      console.error('Error recording episode:', error);
      return false;
    }

    if (isFullyWatched) {
      // Record activity and award points
      await recordUserActivity(userId, 'episode', 20);
    }

    return isFullyWatched;
  } catch (err) {
    console.error('Error in recordEpisodeWatched:', err);
    return false;
  }
}

/**
 * Fetch user's tier information for display
 */
export async function fetchUserTierInfo(userId: string) {
  try {
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('total_points, current_tier, tier_points_progress')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching tier info:', error);
      return null;
    }

    if (!stats) {
      return { tier: 'Beginner', icon: '🌱', points: 0, progress: 0 };
    }

    const tierInfo = await calculateUserTier(stats.total_points);
    return {
      tier: stats.current_tier || tierInfo.tier,
      icon: tierInfo.icon,
      points: stats.total_points,
      progress: stats.tier_points_progress,
      nextTierPoints: tierInfo.nextTierPoints,
    };
  } catch (err) {
    console.error('Error in fetchUserTierInfo:', err);
    return null;
  }
}
