
CREATE TABLE public.saved_outputs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool TEXT NOT NULL CHECK (tool IN ('email','meeting','planner','research')),
  title TEXT NOT NULL,
  prompt JSONB NOT NULL DEFAULT '{}'::jsonb,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX saved_outputs_user_tool_idx ON public.saved_outputs(user_id, tool, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_outputs TO authenticated;
GRANT ALL ON public.saved_outputs TO service_role;
ALTER TABLE public.saved_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved_outputs" ON public.saved_outputs FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER saved_outputs_touch BEFORE UPDATE ON public.saved_outputs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
