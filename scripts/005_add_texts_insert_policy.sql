-- Add INSERT policy for texts table to allow authenticated users to create texts
CREATE POLICY "Authenticated users can insert texts"
  ON public.texts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
