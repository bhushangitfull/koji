import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';

export interface UserStats {
  streak: number;
  wordsLearned: number;
  phrasesLearned: number;
  minutesToday: number;
  totalMinutesThisMonth: number;
  totalEpisodesCompleted: number;
  currentLevel: string;
  thisWeekEpisodes: number;
  weeklyPoints: number;
  totalPoints: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  wordsLearned: number;
  streak: number;
  badge: string;
}

export interface WeeklyActivity {
  day: string;
  minutes: number;
}

/**
 * Hook to fetch current user's statistics
 */
export function useUserStats(userId?: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserStats() {
      try {
        setLoading(true);
        
        // Get current user if userId not provided
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.log('Auth error:', authError);
          // User not logged in, use default stats
          setStats(getDefaultStats());
          setError(null);
          setLoading(false);
          return;
        }

        const currentUserId = userId || user?.id;
        
        if (!currentUserId) {
          console.log('No user ID found, using default stats');
          setStats(getDefaultStats());
          setError(null);
          setLoading(false);
          return;
        }

        // Try to fetch user stats
        const { data, error: fetchError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle(); // Use maybeSingle instead of single to handle empty results

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          throw fetchError;
        }

        // If no data exists, create initial stats for this user
        if (!data) {
          console.log('No stats found for user, creating initial stats...');
          
          const initialStats: UserStats = getDefaultStats();
          
          // Try to insert initial user stats
          const { error: insertError } = await supabase
            .from('user_stats')
            .insert({
              user_id: currentUserId,
              total_points: 0,
              weekly_points: 0,
              daily_streak: 0,
              rank_global: null,
              rank_weekly: null,
            });

          if (insertError) {
            console.error('Error creating initial stats:', insertError);
          }

          setStats(initialStats);
          setError(null);
          setLoading(false);
          return;
        }

        // Transform database data to UserStats format
        const userStats: UserStats = {
          streak: data.daily_streak || 0,
          wordsLearned: Math.floor((data.total_points || 0) / 10), // Assuming 10 points per word
          phrasesLearned: Math.floor((data.total_points || 0) / 25), // Assuming 25 points per phrase
          minutesToday: 0, // This would need to be calculated from activity log
          totalMinutesThisMonth: Math.floor((data.total_points || 0) / 2), // Assuming 2 points per minute
          totalEpisodesCompleted: Math.floor((data.total_points || 0) / 50), // Assuming 50 points per episode
          currentLevel: getLevelFromPoints(data.total_points || 0),
          thisWeekEpisodes: Math.floor((data.weekly_points || 0) / 50),
          weeklyPoints: data.weekly_points || 0,
          totalPoints: data.total_points || 0,
        };

        setStats(userStats);
        setError(null);
      } catch (err) {
        console.error('Error in fetchUserStats:', err);
        setError(err as Error);
        // Set default stats even on error so UI doesn't break
        setStats(getDefaultStats());
      } finally {
        setLoading(false);
      }
    }

    fetchUserStats();
  }, [userId]);

  return { stats, loading, error, refetch: () => {} };
}

/**
 * Hook to fetch leaderboard data
 */
export function useLeaderboard(weekNumber?: number) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        
        // Get current week number if not provided
        const currentWeek = weekNumber || getCurrentWeekNumber();
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.log('Auth error in leaderboard:', authError);
        }

        const { data, error: fetchError } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('week_number', currentWeek)
          .order('rank', { ascending: true })
          .limit(10);

        if (fetchError) {
          console.error('Leaderboard fetch error:', fetchError);
          throw fetchError;
        }

        // If no data, show empty state
        if (!data || data.length === 0) {
          console.log('No leaderboard data found for week', currentWeek);
          setLeaderboard([]);
          setError(null);
          setLoading(false);
          return;
        }

        // Transform database data to LeaderboardEntry format
        const entries: LeaderboardEntry[] = data.map((entry:any) => ({
          rank: entry.rank,
          name: entry.user_id === user?.id ? 'You' : entry.username,
          wordsLearned: Math.floor((entry.total_points || 0) / 10),
          streak: 0, // This would need to be fetched from user_stats
          badge: entry.rank <= 3 ? getMedalEmoji(entry.rank) : '',
        }));

        setLeaderboard(entries);
        setError(null);
      } catch (err) {
        console.error('Error in fetchLeaderboard:', err);
        setError(err as Error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [weekNumber]);

  return { leaderboard, loading, error };
}

/**
 * Hook to fetch weekly activity data
 * Note: You'll need to create an activity/sessions table to track this properly
 */
export function useWeeklyActivity(userId?: string) {
  const [weeklyData, setWeeklyData] = useState<WeeklyActivity[]>([
    { day: 'Mon', minutes: 0 },
    { day: 'Tue', minutes: 0 },
    { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 0 },
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // TODO: Implement this when you have an activity/sessions table
    // For now, returning empty data
    setLoading(false);
  }, [userId]);

  return { weeklyData, loading, error };
}

// Helper functions
function getDefaultStats(): UserStats {
  return {
    streak: 0,
    wordsLearned: 0,
    phrasesLearned: 0,
    minutesToday: 0,
    totalMinutesThisMonth: 0,
    totalEpisodesCompleted: 0,
    currentLevel: 'Beginner',
    thisWeekEpisodes: 0,
    weeklyPoints: 0,
    totalPoints: 0,
  };
}

function getLevelFromPoints(points: number): string {
  if (points < 500) return 'Beginner';
  if (points < 1500) return 'Intermediate';
  if (points < 3000) return 'Advanced';
  return 'Expert';
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

function getMedalEmoji(rank: number): string {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}