-- Create knowledge_base table for Dimension X (Anchor) facts extraction
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  pdf_name TEXT NOT NULL,
  fact TEXT NOT NULL,
  page_number INTEGER,
  line_reference TEXT,
  confidence_score NUMERIC(3,2) DEFAULT 0.95,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own knowledge base entries"
ON public.knowledge_base
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own knowledge base entries"
ON public.knowledge_base
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge base entries"
ON public.knowledge_base
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge base entries"
ON public.knowledge_base
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_knowledge_base_project ON public.knowledge_base(project_id);
CREATE INDEX idx_knowledge_base_user ON public.knowledge_base(user_id);