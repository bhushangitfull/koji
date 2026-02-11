/**
 * TypeScript types for Study feature
 * Maps Supabase database schema to frontend types
 */

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  LISTENING = 'listening',
}

export interface Flashcard {
  id: string;
  episode_id: string;
  vocab_id: string;
  japanese_text: string;
  english_translation: string;
  furigana?: string;
  part_of_speech?: string;
  example_sentence?: string;
  audio_url?: string;
  audio_start_time?: number;
  audio_end_time?: number;
  created_at?: string;
}

export interface FlashcardProgressRecord {
  id: string;
  user_id: string;
  flashcard_id: string;
  times_correct: number;
  times_incorrect: number;
  accuracy_percentage: number;
  last_reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id?: string;
  vocab_id?: string;
  question_type: QuestionType;
  question_text: string;
  correct_answer: string;
  options?: string[];
  audio_url?: string;
  display_order?: number;
}

export interface Quiz {
  id: string;
  episode_id: string;
  title: string;
  description?: string;
  total_questions: number;
  created_at?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage_correct: number;
  answers: Record<string, string>;
  attempted_at: string;
}

export interface Episode {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudySession {
  episode_id: string;
  episode_title: string;
  flashcards_count: number;
  quiz_available: boolean;
  user_progress?: {
    flashcards_reviewed: number;
    quiz_completed: boolean;
    quiz_score?: number;
  };
}

// Local state types for quiz/flashcard sessions
export interface FlashcardReview {
  flashcard_id: string;
  is_correct: boolean;
  reviewed_at: Date;
}

export interface QuizResponse {
  quiz_id: string;
  answers: Record<string, string>; // question_id -> user_answer
  submitted_at: Date;
}
