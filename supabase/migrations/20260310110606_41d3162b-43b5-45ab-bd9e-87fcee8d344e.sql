
DROP POLICY "Service role can manage leads" ON public.leads;
CREATE POLICY "Service role can insert leads" ON public.leads FOR INSERT WITH CHECK (current_setting('role') = 'service_role');
CREATE POLICY "Service role can update leads" ON public.leads FOR UPDATE USING (current_setting('role') = 'service_role');
CREATE POLICY "Service role can delete leads" ON public.leads FOR DELETE USING (current_setting('role') = 'service_role');
