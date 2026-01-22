-- Create videos storage bucket for compiled animations
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload videos (from render server callback)
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Service role can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Service role can update videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'videos');

-- Add video_url column to knowledge_base for storing rendered video URLs
ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- Add render_status column to track rendering progress
ALTER TABLE public.knowledge_base
ADD COLUMN IF NOT EXISTS render_status TEXT DEFAULT 'pending';