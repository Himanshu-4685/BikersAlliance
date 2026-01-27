-- Insert showroom data
INSERT INTO public.showrooms (
    id, name, slug, brand_id, brand_name, brand_slug, brand_logo,
    street, area, city, state, pincode, landmark,
    phone, email, website,
    timings_weekdays, timings_weekends, timings_holidays,
    services, image, rating, reviews, verified, featured,
    latitude, longitude, description, established, area_served
) VALUES 
-- Honda Galaxy Motors
(
    gen_random_uuid(), 'Honda Galaxy Motors', 'honda-galaxy-motors-delhi', 
    'honda', 'Honda', 'honda', '/brand-images/honda.avif',
    'A-25, Sector 63', 'Noida', 'Delhi', 'Delhi', '110001', 'Near Metro Station',
    '[""+91-9876543210"", ""+91-11-26574890""]'::jsonb, 
    'info@hondagalaxy.com', 'www.hondagalaxy.com',
    '9:00 AM - 8:00 PM', '9:00 AM - 7:00 PM', 'Closed on National Holidays',
    '["Sales", "Service", "Spare Parts", "Accessories", "Insurance", "Finance"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/honda-galaxy', 4.5, 324, true, true,
    28.6139, 77.2090, 
    'Premium Honda authorized dealer with state-of-the-art facility and expert technicians.',
    '2010', '["Delhi", "Noida", "Ghaziabad", "Faridabad"]'::jsonb
),

-- Royal Enfield Store
(
    gen_random_uuid(), 'Royal Enfield Store', 'royal-enfield-store-mumbai',
    'royal-enfield', 'Royal Enfield', 'royal-enfield', '/brand-images/royal-enfield.avif',
    'Shop No. 15, Ground Floor', 'Bandra West', 'Mumbai', 'Maharashtra', '400050', 'Opposite Bandra Station',
    '[""+91-9876543211"", ""+91-22-26574891""]'::jsonb,
    'mumbai@royalenfield.com', 'www.royalenfield.com',
    '10:00 AM - 9:00 PM', '10:00 AM - 8:00 PM', null,
    '["Sales", "Service", "Genuine Parts", "Accessories", "Gear & Apparel"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/re-store', 4.7, 189, true, true,
    19.0596, 72.8295,
    'Experience the Royal Enfield legacy with our exclusive store featuring the complete range.',
    '2015', '["Mumbai", "Thane", "Navi Mumbai"]'::jsonb
),

-- TVS Motors Hub
(
    gen_random_uuid(), 'TVS Motors Hub', 'tvs-motors-hub-bangalore',
    'tvs', 'TVS', 'tvs', '/brand-images/tvs.avif',
    '234, MG Road', 'Brigade Road', 'Bangalore', 'Karnataka', '560001', 'Near Commercial Street',
    '[""+91-9876543212"", ""+91-80-26574892""]'::jsonb,
    'bangalore@tvsmotors.com', 'www.tvsmotor.com',
    '9:30 AM - 8:30 PM', '9:30 AM - 7:30 PM', null,
    '["Sales", "Service", "Spare Parts", "Accessories", "Insurance"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/tvs-hub', 4.4, 267, true, false,
    12.9716, 77.5946,
    'Comprehensive TVS service center with latest models and expert service.',
    '2012', '["Bangalore", "Mysore", "Hubli"]'::jsonb
),

-- Bajaj Auto Center
(
    gen_random_uuid(), 'Bajaj Auto Center', 'bajaj-auto-center-pune',
    'bajaj', 'Bajaj', 'bajaj', '/brand-images/bajaj.avif',
    '123, FC Road', 'Shivajinagar', 'Pune', 'Maharashtra', '411004', 'Near Pune Central',
    '[""+91-9876543213"", ""+91-20-26574893""]'::jsonb,
    'pune@bajajauto.com', 'www.bajajauto.com',
    '9:00 AM - 8:00 PM', '9:00 AM - 7:00 PM', 'Sunday Closed',
    '["Sales", "Service", "Spare Parts", "Finance", "Insurance", "Exchange"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/bajaj-center', 4.3, 156, true, false,
    18.5204, 73.8567,
    'Trusted Bajaj dealer providing comprehensive motorcycle solutions.',
    '2008', '["Pune", "Nashik", "Aurangabad"]'::jsonb
),

-- Hero MotoCorp World
(
    gen_random_uuid(), 'Hero MotoCorp World', 'hero-motocorp-world-chennai',
    'hero', 'Hero', 'hero', '/brand-images/hero.avif',
    '45, Anna Salai', 'Mount Road', 'Chennai', 'Tamil Nadu', '600002', 'Near Spencer Plaza',
    '[""+91-9876543213"", ""+91-44-26574893""]'::jsonb,
    'chennai@heromotocorp.com', 'www.heromotocorp.com',
    '9:00 AM - 8:00 PM', '9:00 AM - 7:00 PM', null,
    '["Sales", "Service", "Spare Parts", "Insurance", "Finance", "Exchange"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/hero-world', 4.6, 298, true, true,
    13.0827, 80.2707,
    'India''s largest two-wheeler manufacturer authorized dealership.',
    '2011', '["Chennai", "Coimbatore", "Madurai"]'::jsonb
),

-- Yamaha Square
(
    gen_random_uuid(), 'Yamaha Square', 'yamaha-square-hyderabad',
    'yamaha', 'Yamaha', 'yamaha', '/brand-images/yamaha.avif',
    '89, Banjara Hills', 'Road No. 12', 'Hyderabad', 'Telangana', '500034', 'Near GVK One Mall',
    '[""+91-9876543216"", ""+91-40-26574896""]'::jsonb,
    'hyderabad@yamaha-motor.co.in', 'www.yamaha-motor.co.in',
    '10:00 AM - 8:30 PM', '10:00 AM - 7:30 PM', null,
    '["Sales", "Service", "Genuine Parts", "Accessories", "Racing Parts"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/yamaha-square', 4.6, 278, true, true,
    17.4485, 78.3908,
    'Premium Yamaha dealership with modern facility and trained professionals.',
    '2016', '["Hyderabad", "Secunderabad", "Warangal"]'::jsonb
),

-- KTM Performance Centre
(
    gen_random_uuid(), 'KTM Performance Centre', 'ktm-performance-centre-gurgaon',
    'ktm', 'KTM', 'ktm', '/brand-images/ktm.avif',
    'Unit 12, Sector 29', 'Leisure Valley Road', 'Gurgaon', 'Haryana', '122001', 'Near Ambience Mall',
    '[""+91-9876543217"", ""+91-124-26574897""]'::jsonb,
    'gurgaon@ktmindia.com', 'www.ktm.com',
    '10:00 AM - 8:00 PM', '10:00 AM - 7:00 PM', null,
    '["Sales", "Service", "Performance Parts", "Racing Gear", "Track Support"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/ktm-centre', 4.8, 345, true, true,
    28.4089, 77.0687,
    'Premium KTM dealership for performance motorcycle enthusiasts.',
    '2018', '["Gurgaon", "Delhi", "Faridabad"]'::jsonb
),

-- Suzuki Motorcycle India
(
    gen_random_uuid(), 'Suzuki Motorcycle India', 'suzuki-motorcycle-india-kolkata',
    'suzuki', 'Suzuki', 'suzuki', '/brand-images/suzuki.avif',
    '56, Park Street', 'Park Circus', 'Kolkata', 'West Bengal', '700016', 'Near South City Mall',
    '[""+91-9876543217"", ""+91-33-26574897""]'::jsonb,
    'kolkata@suzukimotorcycle.co.in', null,
    '9:30 AM - 7:30 PM', '9:30 AM - 6:30 PM', null,
    '["Sales", "Service", "Spare Parts", "Accessories", "Insurance"]'::jsonb,
    'https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/suzuki-store', 4.2, 198, true, false,
    22.5726, 88.3639,
    'Authorized Suzuki dealer providing quality motorcycles and service.',
    '2014', '["Kolkata", "Howrah", "Durgapur"]'::jsonb
);