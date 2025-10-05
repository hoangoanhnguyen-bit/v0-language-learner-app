-- Create texts table
CREATE TABLE IF NOT EXISTS public.texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
  word_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.texts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own texts"
  ON public.texts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own texts"
  ON public.texts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own texts"
  ON public.texts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own texts"
  ON public.texts FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS texts_user_id_idx ON public.texts(user_id);
CREATE INDEX IF NOT EXISTS texts_created_at_idx ON public.texts(created_at DESC);
