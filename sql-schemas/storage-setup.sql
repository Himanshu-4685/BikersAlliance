-- Create storage folder structure for showrooms
-- This script should be run in the Supabase SQL editor to create the necessary storage folders

-- Note: Storage policies need to be set up through the Supabase Dashboard
-- This is just a reference for the folder structure that should be created:

-- In Supabase Storage -> BikersAlliance bucket:
-- /Image/
--   /Showrooms/
--     honda-galaxy
--     re-store
--     tvs-hub
--     bajaj-center
--     hero-world
--     yamaha-square
--     ktm-centre
--     suzuki-store
--   /Charging-Stations/
--     shell-recharge
--     tata-power
--     ather-grid
--     hero-electric
--     bpcl-charge
--     fortum-drive

-- Base Storage URL Pattern:
-- https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/{filename}

-- Storage policies that need to be created in Supabase Dashboard:
-- 1. Allow public read access to images
-- 2. Allow authenticated users to upload images (for admin)

-- Create policy for public read access (run in Supabase SQL editor):
CREATE POLICY "Allow public read access on images" ON storage.objects
FOR SELECT USING (bucket_id = 'Bikeralliance' AND (storage.foldername(name))[1] = 'Image');

-- Create policy for authenticated uploads (run in Supabase SQL editor):
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'Bikeralliance' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = 'Image');