/**
 * User Profile Hook
 * Manages user profile data from Supabase
 */

import { supabase } from '@/utils/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  display_name: string;
  bio: string | null;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  total_study_minutes: number;
  current_streak: number;
  longest_streak: number;
  total_episodes_watched: number;
  total_words_learned: number;
  total_phrases_learned: number;
  profile_completed: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      throw new Error('No user logged in');
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Complete user setup
  const completeSetup = async (setupData: {
    display_name: string;
    jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
    bio?: string;
  }) => {
    try {
      const updates = {
        ...setupData,
        profile_completed: true,
      };

      return await updateProfile(updates);
    } catch (err) {
      throw err;
    }
  };

  // Increment study stats
  const incrementStats = async (stats: {
    study_minutes?: number;
    episodes_watched?: number;
    words_learned?: number;
    phrases_learned?: number;
  }) => {
    if (!profile) return;

    const updates: Partial<UserProfile> = {};

    if (stats.study_minutes) {
      updates.total_study_minutes = profile.total_study_minutes + stats.study_minutes;
    }
    if (stats.episodes_watched) {
      updates.total_episodes_watched = profile.total_episodes_watched + stats.episodes_watched;
    }
    if (stats.words_learned) {
      updates.total_words_learned = profile.total_words_learned + stats.words_learned;
    }
    if (stats.phrases_learned) {
      updates.total_phrases_learned = profile.total_phrases_learned + stats.phrases_learned;
    }

    return await updateProfile(updates);
  };

  // Update streak
  const updateStreak = async (streak: number) => {
    if (!profile) return;

    const updates: Partial<UserProfile> = {
      current_streak: streak,
    };

    if (streak > profile.longest_streak) {
      updates.longest_streak = streak;
    }

    return await updateProfile(updates);
  };

  // Load profile on mount and when user changes
  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Profile changed:', payload);
          if (payload.new) {
            setProfile(payload.new as UserProfile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    completeSetup,
    incrementStats,
    updateStreak,
  };
};