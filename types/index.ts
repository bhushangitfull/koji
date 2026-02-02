/**
 * FRONTEND-ONLY TypeScript Types for Koji
 * 
 * This file contains types used only in the frontend/UI layer.
 * Shared types with backend are in backend/src/types/index.ts
 * 
 * Note: Backend types are server-focused (database structures).
 *       Frontend types are client-focused (UI and local operations).
 */

/**
 * LOCAL TYPES - Frontend only
 */

/**
 * Video player subtitle types
 * Used for parsing and displaying subtitles locally
 */
export interface Subtitle {
  index: number;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  text: string;
  startTimeStr: string;
  endTimeStr: string;
}

/**
 * Local Episode representation
 * Frontend version - stores local file paths and playback state
 * Backend Episode stores server URLs and user_id
 */
export interface LocalEpisode {
  id: string;
  title: string;
  videoUri: string; // Local file path
  subtitleUri?: string; // Local file path
  subtitles?: Subtitle[];
  duration?: number;
  size: number; // File size in bytes
  uploadedAt: number; // Timestamp
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  currentTime?: number; // Watch progress
  lastWatchedAt?: number;
}

/**
 * Local Vocabulary Word
 * Frontend version - includes frequency and learning metadata
 */
export interface LocalVocabularyWord {
  id: string;
  episodeId: string;
  japanese: string; // Kanji
  hiragana: string; // Hiragana reading
  english: string; // English definition
  partOfSpeech?: string; // noun, verb, adjective, etc
  frequency: number; // How many times appears
  timestamp?: number; // First appearance in video
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

/**
 * Local User Vocabulary Progress
 * Frontend version - local learning progress
 */
export interface LocalUserVocabulary {
  id: string;
  vocabularyId: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  timesReviewed: number;
  nextReviewDate: number;
  lastReviewedAt?: number;
  retentionScore: number; // 0-1 scale
  addedAt: number;
}

/**
 * Quiz Question Types
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  LISTENING = 'listening',
}

/**
 * Local Quiz Question
 */
export interface LocalQuizQuestion {
  id: string;
  vocabularyId: string;
  type: QuestionType;
  questionText: string;
  correctAnswer: string;
  options?: string[]; // For multiple choice
  userAnswer?: string;
  isCorrect?: boolean;
  timestamp: number;
}

/**
 * Local Quiz Session
 */
export interface LocalQuiz {
  id: string;
  episodeId: string;
  type: 'episode' | 'weekly_test';
  questions: LocalQuizQuestion[];
  totalScore: number;
  completedAt?: number;
  createdAt: number;
}

/**
 * File upload response
 */
export interface UploadResponse {
  success: boolean;
  episodeId?: string;
  error?: string;
  message?: string;
}
