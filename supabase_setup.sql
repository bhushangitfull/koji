-- ============================================================================
-- KOJI - Complete Supabase Schema Setup
-- Tracks: Streaks, Points, Ranks, Episode Progress, User Tiers
-- ============================================================================

-- ============================================================================
-- 1. USER_STATS - Core gamification table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_points integer DEFAULT 0,
  weekly_points integer DEFAULT 0,
  daily_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date timestamp with time zone,
  rank_global integer DEFAULT 1,
  rank_weekly integer DEFAULT 1,
  current_tier character varying DEFAULT 'Beginner', -- Beginner, Learner, Intermediate, Advanced, Master
  tier_points_progress numeric DEFAULT 0, -- Points towards next tier
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_stats_pkey PRIMARY KEY (id),
  CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- ============================================================================
-- 2. USER_TIER_RANKS - Tier progression system
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_tier_ranks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rank_name character varying NOT NULL UNIQUE, -- Beginner, Learner, Intermediate, Advanced, Master, Legend
  min_points integer NOT NULL,
  max_points integer,
  badge_icon character varying,
  badge_color character varying,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_tier_ranks_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 3. USER_EPISODE_PROGRESS - Track episode watching
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_episode_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  episode_id uuid NOT NULL,
  watch_start_time integer DEFAULT 0, -- seconds
  watch_end_time integer DEFAULT 0, -- seconds
  total_duration integer, -- episode total duration in seconds
  is_fully_watched boolean DEFAULT false, -- true when watched >= 90% or full duration
  watched_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_episode_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_episode_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_episode_progress_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id),
  CONSTRAINT unique_user_episode UNIQUE (user_id, episode_id)
);

-- ============================================================================
-- 4. USER_DAILY_ACTIVITY - Track daily activities for streak calculation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_daily_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_date date NOT NULL,
  activity_type character varying, -- 'quiz', 'episode', 'flashcard', 'combined'
  episode_completed boolean DEFAULT false,
  quiz_completed boolean DEFAULT false,
  flashcard_reviewed boolean DEFAULT false,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_daily_activity_pkey PRIMARY KEY (id),
  CONSTRAINT user_daily_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT unique_user_daily_activity UNIQUE (user_id, activity_date)
);

-- ============================================================================
-- 5. QUIZZES - Quiz templates for episodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  quiz_type character varying DEFAULT 'multiple_choice', -- multiple_choice, fill_blank, listening, speaking
  total_questions integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quizzes_pkey PRIMARY KEY (id),
  CONSTRAINT quizzes_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id),
  CONSTRAINT unique_episode_quiz UNIQUE (episode_id)
);

-- ============================================================================
-- 5.1 QUIZ_QUESTIONS - Questions for each quiz
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  vocab_id uuid,
  question_type character varying NOT NULL, -- 'multiple_choice', 'fill_blank', 'listening', 'speaking'
  question_text text NOT NULL,
  correct_answer character varying NOT NULL,
  options text[], -- JSON array of options for multiple choice
  audio_url text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT quiz_questions_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id),
  CONSTRAINT quiz_questions_vocab_id_fkey FOREIGN KEY (vocab_id) REFERENCES public.vocabulary(id)
);

-- ============================================================================
-- 5. USER_QUIZ_ATTEMPTS - Enhanced with points tracking
-- ============================================================================
ALTER TABLE IF EXISTS public.user_quiz_attempts
ADD COLUMN IF NOT EXISTS total_points_earned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_bonus_points integer DEFAULT 0;

-- ============================================================================
-- 6. LEADERBOARD - Global and weekly rankings
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username character varying,
  avatar_url text,
  total_points integer DEFAULT 0,
  rank integer DEFAULT 1,
  jlpt_level character varying DEFAULT 'N5',
  week_number integer,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leaderboard_pkey PRIMARY KEY (id),
  CONSTRAINT leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- ============================================================================
-- 7. USER_ACHIEVEMENTS - Badges and milestones
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_type character varying, -- 'first_quiz', 'streak_7', 'tier_unlock', 'points_milestone'
  achievement_name character varying NOT NULL,
  achievement_icon character varying,
  points_reward integer DEFAULT 0,
  unlocked_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- ============================================================================
-- 8. CREATE INDEXES for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_points ON public.user_stats(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_rank_global ON public.user_stats(rank_global);
CREATE INDEX IF NOT EXISTS idx_user_episode_progress_user_id ON public.user_episode_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_episode_progress_episode_id ON public.user_episode_progress(episode_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_activity_user_id ON public.user_daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_activity_date ON public.user_daily_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_quizzes_episode_id ON public.quizzes(episode_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON public.leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON public.leaderboard(rank);

-- ============================================================================
-- 9. INSERT DEFAULT TIER RANKS
-- ============================================================================
INSERT INTO public.user_tier_ranks (rank_name, min_points, max_points, badge_icon, badge_color, description)
VALUES
  ('Beginner', 0, 99, '🌱', '#A8E6CF', 'Just started learning!'),
  ('Learner', 100, 299, '📚', '#7FE5DE', 'Making progress!'),
  ('Intermediate', 300, 699, '⚡', '#FFB6D9', 'Solid learner!'),
  ('Advanced', 700, 1499, '🎯', '#FFD700', 'Expert level!'),
  ('Master', 1500, 2999, '👑', '#9B59B6', 'Master of Japanese!'),
  ('Legend', 3000, 999999, '✨', '#FF6B6B', 'Living legend!')
ON CONFLICT (rank_name) DO NOTHING;

-- ============================================================================
-- 10. ENABLE ROW LEVEL SECURITY (RLS) - Commented for dev, enable in production

-- ============================================================================
-- ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_episode_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_daily_activity ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (if RLS is enabled)
-- CREATE POLICY "Users can view their own stats" ON public.user_stats
--   FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can view their own episode progress" ON public.user_episode_progress
--   FOR SELECT USING (auth.uid() = user_id);
