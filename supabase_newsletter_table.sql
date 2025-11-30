-- Newsletter Subscriptions Table for Supabase
-- Run this in your Supabase SQL Editor to create the newsletter subscriptions table

CREATE TABLE newsletter_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  subscribed_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster email lookups
CREATE INDEX idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);

-- Create index for status filtering
CREATE INDEX idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);

-- Enable RLS (Row Level Security)
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy to allow inserts for anyone (for newsletter signup)
CREATE POLICY "Allow newsletter subscription inserts" ON newsletter_subscriptions
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow reading for authenticated users only (for admin purposes)
CREATE POLICY "Allow newsletter subscription reads for authenticated users" ON newsletter_subscriptions
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Optional: Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Optional: Create trigger to automatically update updated_at
CREATE TRIGGER update_newsletter_subscriptions_updated_at 
  BEFORE UPDATE ON newsletter_subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some example data (optional)
-- INSERT INTO newsletter_subscriptions (email) VALUES 
--   ('test@example.com'),
--   ('rider@bikersalliance.com');