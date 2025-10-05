-- Create study_activities table to track daily study sessions
CREATE TABLE IF NOT EXISTS public.study_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_id UUID REFERENCES public.texts(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('read', 'quiz_completed', 'word_lookup')),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.study_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activities"
  ON public.study_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON public.study_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON public.study_activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON public.study_activities FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS study_activities_user_id_idx ON public.study_activities(user_id);
CREATE INDEX IF NOT EXISTS study_activities_date_idx ON public.study_activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS study_activities_user_date_idx ON public.study_activities(user_id, activity_date DESC);

-- Create a unique constraint to prevent duplicate activities on the same day
CREATE UNIQUE INDEX IF NOT EXISTS study_activities_user_date_unique 
  ON public.study_activities(user_id, activity_date);
