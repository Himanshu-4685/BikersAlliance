-- Add category and featured columns to news, videos, and web_stories tables
-- Run this in your Supabase SQL editor

-- Add category and featured columns to news table
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add category and featured columns to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS views TEXT DEFAULT '0';

-- Add category and featured columns to web_stories table
ALTER TABLE web_stories 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for better performance on filtering
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(featured);
CREATE INDEX IF NOT EXISTS idx_webstories_category ON web_stories(category);
CREATE INDEX IF NOT EXISTS idx_webstories_featured ON web_stories(featured);

-- Update existing records to have default values
UPDATE news SET category = 'General' WHERE category IS NULL;
UPDATE news SET featured = false WHERE featured IS NULL;

UPDATE videos SET category = 'General' WHERE category IS NULL;
UPDATE videos SET featured = false WHERE featured IS NULL;
UPDATE videos SET duration = '0:00' WHERE duration IS NULL;
UPDATE videos SET views = '0' WHERE views IS NULL;

UPDATE web_stories SET category = 'General' WHERE category IS NULL;
UPDATE web_stories SET featured = false WHERE featured IS NULL;