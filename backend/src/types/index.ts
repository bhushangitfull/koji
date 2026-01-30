export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  jlpt_level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Episode {
  id: string;
  user_id: string;
  title: string;
  subtitle_file_url?: string;
  audio_file_url?: string;
  duration: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vocabulary {
  id: string;
  episode_id: string;
  japanese: string;
  hiragana: string;
  english: string;
  parts_of_speech: string[];
  kanji_breakdown?: Record<string, unknown>;
  first_appearance_timestamp: number;
  times_in_episode: number;
  is_phrase: boolean;
  created_at: Date;
}

export interface UserVocabulary {
  id: string;
  user_id: string;
  vocab_id: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  times_reviewed: number;
  next_review_date: Date;
  last_reviewed_at?: Date;
  retention_score: number;
  created_at: Date;
}

export interface Quiz {
  id: string;
  episode_id: string;
  user_id: string;
  quiz_type: 'episode' | 'weekly_test';
  total_questions: number;
  user_score: number;
  created_at: Date;
  completed_at?: Date;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  vocab_id: string;
  question_type: 'multiple_choice' | 'fill_blank';
  question_text: string;
  correct_answer: string;
  options?: string[];
  user_answer?: string;
  is_correct?: boolean;
  created_at: Date;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_points: number;
  weekly_points: number;
  daily_streak: number;
  last_activity_date: Date;
  rank_global: number;
  rank_weekly: number;
  created_at: Date;
  updated_at: Date;
}

export interface Leaderboard {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_points: number;
  rank: number;
  jlpt_level?: string;
  week_number?: number;
  updated_at: Date;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_name: string;
  badge_icon: string;
  unlocked_at: Date;
}

export interface Friendship {
  id: string;
  user_id_1: string;
  user_id_2: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  expiresIn: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
