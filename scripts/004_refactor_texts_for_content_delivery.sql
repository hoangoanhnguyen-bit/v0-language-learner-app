-- Drop existing texts table and recreate with new schema
DROP TABLE IF EXISTS public.texts CASCADE;

-- Create new texts table (shared across users)
CREATE TABLE IF NOT EXISTS public.texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  source TEXT CHECK (source IN ('ai', 'web')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_texts table to track which texts users have seen
CREATE TABLE IF NOT EXISTS public.user_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id UUID NOT NULL REFERENCES public.texts(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  difficulty TEXT CHECK (difficulty IN ('too_easy', 'just_right', 'too_hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, text_id)
);

-- Enable Row Level Security
ALTER TABLE public.texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_texts ENABLE ROW LEVEL SECURITY;

-- RLS policies for texts (everyone can read, only system can insert)
CREATE POLICY "Anyone can view texts"
  ON public.texts FOR SELECT
  USING (true);

-- RLS policies for user_texts
CREATE POLICY "Users can view their own text assignments"
  ON public.user_texts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own text assignments"
  ON public.user_texts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own text assignments"
  ON public.user_texts FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS texts_language_level_idx ON public.texts(language, level);
CREATE INDEX IF NOT EXISTS user_texts_user_id_idx ON public.user_texts(user_id);
CREATE INDEX IF NOT EXISTS user_texts_status_idx ON public.user_texts(status);
CREATE INDEX IF NOT EXISTS user_texts_created_at_idx ON public.user_texts(created_at DESC);
