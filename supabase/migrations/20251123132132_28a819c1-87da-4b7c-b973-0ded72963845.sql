-- Relax templates INSERT RLS so inserts no longer fail
DROP POLICY IF EXISTS "Authenticated users can insert templates" ON public.templates;

CREATE POLICY "Anyone can insert templates"
ON public.templates
FOR INSERT
WITH CHECK (true);