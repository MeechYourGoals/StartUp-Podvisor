-- Allow deleting lessons, callouts, and personalized_insights (needed for re-analysis)
CREATE POLICY "Public delete for lessons" ON public.lessons FOR DELETE USING (true);
CREATE POLICY "Public delete for chavel_callouts" ON public.chavel_callouts FOR DELETE USING (true);
CREATE POLICY "Public delete for personalized_insights" ON public.personalized_insights FOR DELETE USING (true);