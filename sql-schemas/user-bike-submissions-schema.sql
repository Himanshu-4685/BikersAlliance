-- Create user_bike_submissions table to track which users submitted which bike listings
-- This table links users to their sell-bike form submissions for dashboard tracking

CREATE TABLE public.user_bike_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  
  -- Foreign key references
  user_id integer NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  used_bike_id uuid NOT NULL REFERENCES public.used_bikes(id) ON DELETE CASCADE,
  
  -- Additional tracking information
  submission_status character varying DEFAULT 'active' CHECK (submission_status IN ('active', 'cancelled', 'withdrawn')),
  notes text, -- User can add notes about their submission
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT user_bike_submissions_pkey PRIMARY KEY (id),
  -- Ensure one submission record per user per bike
  CONSTRAINT unique_user_bike_submission UNIQUE (user_id, used_bike_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_bike_submissions_user_id ON public.user_bike_submissions (user_id);
CREATE INDEX idx_user_bike_submissions_used_bike_id ON public.user_bike_submissions (used_bike_id);
CREATE INDEX idx_user_bike_submissions_status ON public.user_bike_submissions (submission_status);
CREATE INDEX idx_user_bike_submissions_created_at ON public.user_bike_submissions (created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_bike_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own submissions (match by email since users table uses email)
CREATE POLICY "Users can view own submissions" ON public.user_bike_submissions
  FOR SELECT USING (
    user_id IN (
      SELECT u.user_id FROM public.users u WHERE u.email = auth.email()
    )
  );

-- Users can insert their own submissions (handled by API)
CREATE POLICY "Users can insert own submissions" ON public.user_bike_submissions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT u.user_id FROM public.users u WHERE u.email = auth.email()
    )
  );

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions" ON public.user_bike_submissions
  FOR UPDATE USING (
    user_id IN (
      SELECT u.user_id FROM public.users u WHERE u.email = auth.email()
    )
  );

-- Allow admins to do everything
CREATE POLICY "Allow all for admins" ON public.user_bike_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE admin.id = auth.uid() AND admin.is_active = true
    )
  );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_bike_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_bike_submissions_updated_at
    BEFORE UPDATE ON public.user_bike_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_bike_submissions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.user_bike_submissions IS 'Tracks which users submitted which bike listings for sell-bike form';
COMMENT ON COLUMN public.user_bike_submissions.user_id IS 'References users.id - the user who submitted the bike listing';
COMMENT ON COLUMN public.user_bike_submissions.used_bike_id IS 'References used_bikes.id - the bike listing that was submitted';
COMMENT ON COLUMN public.user_bike_submissions.submission_status IS 'Status of user submission: active, cancelled, withdrawn';
COMMENT ON COLUMN public.user_bike_submissions.notes IS 'Additional notes from the user about their submission';