-- Flashcards table: stores individual flashcard metadata with audio
CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL,
  vocab_id uuid NOT NULL,
  japanese_text character varying NOT NULL,
  english_translation text NOT NULL,
  furigana character varying,
  part_of_speech character varying,
  example_sentence text,
  audio_url text,
  audio_start_time integer,
  audio_end_time integer,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT flashcards_pkey PRIMARY KEY (id),
  CONSTRAINT flashcards_episode_id_fkey FOREIGN KEY (episode_id) REFERENCES public.episodes(id),
  CONSTRAINT flashcards_vocab_id_fkey FOREIGN KEY (vocab_id) REFERENCES public.vocabulary(id)
);

-- User flashcard progress: tracks which flashcards user has reviewed and their performance
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  flashcard_id uuid NOT NULL,
  times_correct integer DEFAULT 0,
  times_incorrect integer DEFAULT 0,
  accuracy_percentage numeric DEFAULT 0.0,
  last_reviewed_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_flashcard_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_flashcard_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT user_flashcard_progress_flashcard_id_fkey FOREIGN KEY (flashcard_id) REFERENCES public.flashcards(id),
  CONSTRAINT unique_user_flashcard UNIQUE (user_id, flashcard_id)
);

-- Add furigana and kanji breakdown to vocabulary table if not exists
ALTER TABLE public.vocabulary 
ADD COLUMN IF NOT EXISTS furigana character varying,
ADD COLUMN IF NOT EXISTS audio_url text,
ADD COLUMN IF NOT EXISTS example_sentence text;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_flashcards_episode_id ON public.flashcards(episode_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_vocab_id ON public.flashcards(vocab_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id ON public.user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_flashcard_id ON public.user_flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_episode_id ON public.vocabulary(episode_id);
