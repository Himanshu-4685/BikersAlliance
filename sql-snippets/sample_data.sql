-- ==============================================
-- BikersAlliance Admin Panel SQL Setup
-- ==============================================

-- 1. Create Admin User with Bcrypt Hash
-- Note: Replace the hash with actual bcrypt hash of your admin password
INSERT INTO admin (name, email, password_hash, role, phone) 
VALUES (
    'Super Admin',
    'admin@bikersalliance.com',
    '$2b$10$7QGtLrNWQOPPztZFKSyUm.P7.1JSm7qNJ/3xKzF8nWZtWJ6FJNgXa', -- Hash for "admin123!"
    'super_admin',
    '+91-9876543210'
);

-- 2. Sample Brand Creation
INSERT INTO brands (brand_name, logo_url, country, description) 
VALUES 
    ('Honda', 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/Brand_image/honda.avif', 'Japan', 'Honda Motor Company - Leading motorcycle manufacturer'),
    ('Yamaha', 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/Brand_image/yamaha.avif', 'Japan', 'Yamaha Motor Corporation - Premium motorcycle brand'),
    ('Hero', 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/Brand_image/hero.avif', 'India', 'Hero MotoCorp - Worlds largest two-wheeler manufacturer'),
    ('Bajaj', 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/Brand_image/bajaj.avif', 'India', 'Bajaj Auto - Leading Indian motorcycle manufacturer'),
    ('Royal Enfield', 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/Brand_image/royal-enfield.avif', 'India', 'Royal Enfield - Iconic motorcycle brand since 1901');

-- 3. Sample Model Creation
INSERT INTO models (brand_id, model_name) 
SELECT 
    brand_id,
    CASE 
        WHEN brand_name = 'Honda' THEN 'CBR 650R'
        WHEN brand_name = 'Yamaha' THEN 'R15 V4'
        WHEN brand_name = 'Hero' THEN 'Splendor Plus'
        WHEN brand_name = 'Bajaj' THEN 'Pulsar NS200'
        WHEN brand_name = 'Royal Enfield' THEN 'Classic 350'
    END as model_name
FROM brands 
WHERE brand_name IN ('Honda', 'Yamaha', 'Hero', 'Bajaj', 'Royal Enfield');

-- 4. Sample Variant Creation
INSERT INTO variants (model_id, brand_id, variant_name, on_road_price, url)
SELECT 
    m.model_id,
    m.brand_id,
    CASE 
        WHEN b.brand_name = 'Honda' THEN 'CBR 650R Standard'
        WHEN b.brand_name = 'Yamaha' THEN 'R15 V4 Racing Blue'
        WHEN b.brand_name = 'Hero' THEN 'Splendor Plus Standard'
        WHEN b.brand_name = 'Bajaj' THEN 'Pulsar NS200 FI'
        WHEN b.brand_name = 'Royal Enfield' THEN 'Classic 350 Dark'
    END as variant_name,
    CASE 
        WHEN b.brand_name = 'Honda' THEN 850000
        WHEN b.brand_name = 'Yamaha' THEN 185000
        WHEN b.brand_name = 'Hero' THEN 75000
        WHEN b.brand_name = 'Bajaj' THEN 145000
        WHEN b.brand_name = 'Royal Enfield' THEN 195000
    END as on_road_price,
    CASE 
        WHEN b.brand_name = 'Honda' THEN '/bikes/honda/cbr-650r/standard'
        WHEN b.brand_name = 'Yamaha' THEN '/bikes/yamaha/r15-v4/racing-blue'
        WHEN b.brand_name = 'Hero' THEN '/bikes/hero/splendor-plus/standard'
        WHEN b.brand_name = 'Bajaj' THEN '/bikes/bajaj/pulsar-ns200/fi'
        WHEN b.brand_name = 'Royal Enfield' THEN '/bikes/royal-enfield/classic-350/dark'
    END as url
FROM models m
JOIN brands b ON m.brand_id = b.brand_id;

-- 5. Sample Specifications Data
INSERT INTO specs (variant_id, engine_type, displacement, max_power, max_torque, other_features)
SELECT 
    v.variant_id,
    CASE 
        WHEN b.brand_name = 'Honda' THEN '4-Stroke, DOHC, Liquid Cooled'
        WHEN b.brand_name = 'Yamaha' THEN '4-Stroke, SOHC, Liquid Cooled'
        WHEN b.brand_name = 'Hero' THEN '4-Stroke, OHC, Air Cooled'
        WHEN b.brand_name = 'Bajaj' THEN '4-Stroke, SOHC, Liquid Cooled'
        WHEN b.brand_name = 'Royal Enfield' THEN '4-Stroke, SOHC, Air/Oil Cooled'
    END as engine_type,
    CASE 
        WHEN b.brand_name = 'Honda' THEN '649cc'
        WHEN b.brand_name = 'Yamaha' THEN '155cc'
        WHEN b.brand_name = 'Hero' THEN '97.2cc'
        WHEN b.brand_name = 'Bajaj' THEN '199.5cc'
        WHEN b.brand_name = 'Royal Enfield' THEN '349cc'
    END as displacement,
    CASE 
        WHEN b.brand_name = 'Honda' THEN '94 BHP @ 12000 rpm'
        WHEN b.brand_name = 'Yamaha' THEN '18.4 BHP @ 10000 rpm'
        WHEN b.brand_name = 'Hero' THEN '8.02 BHP @ 8000 rpm'
        WHEN b.brand_name = 'Bajaj' THEN '24.13 BHP @ 9750 rpm'
        WHEN b.brand_name = 'Royal Enfield' THEN '20.2 BHP @ 6100 rpm'
    END as max_power,
    CASE 
        WHEN b.brand_name = 'Honda' THEN '64 Nm @ 8500 rpm'
        WHEN b.brand_name = 'Yamaha' THEN '14.2 Nm @ 7500 rpm'
        WHEN b.brand_name = 'Hero' THEN '8.05 Nm @ 6000 rpm'
        WHEN b.brand_name = 'Bajaj' THEN '18.74 Nm @ 8000 rpm'
        WHEN b.brand_name = 'Royal Enfield' THEN '27 Nm @ 4000 rpm'
    END as max_torque,
    CASE 
        WHEN b.brand_name = 'Honda' THEN '{"abs": true, "traction_control": true, "riding_modes": ["Sport", "Rain", "Road"], "quick_shifter": true}'::jsonb
        WHEN b.brand_name = 'Yamaha' THEN '{"abs": true, "vva": true, "traction_control": false, "slipper_clutch": true}'::jsonb
        WHEN b.brand_name = 'Hero' THEN '{"abs": false, "kick_start": true, "electric_start": true, "fuel_gauge": true}'::jsonb
        WHEN b.brand_name = 'Bajaj' THEN '{"abs": true, "slipper_clutch": false, "digital_cluster": true, "led_headlight": true}'::jsonb
        WHEN b.brand_name = 'Royal Enfield' THEN '{"abs": true, "tripper_navigation": true, "usb_charging": true, "led_headlight": true}'::jsonb
    END as other_features
FROM variants v
JOIN models m ON v.model_id = m.model_id
JOIN brands b ON v.brand_id = b.brand_id;

-- 6. Sample Status Records
INSERT INTO status (brand_id, model_id, variant_id, status, price_range, expected_launch, launch_date)
SELECT 
    v.brand_id,
    v.model_id,
    v.variant_id,
    CASE 
        WHEN b.brand_name IN ('Honda', 'Royal Enfield') THEN 'new_launch'::status_enum
        ELSE 'upcoming'::status_enum
    END as status,
    CASE 
        WHEN b.brand_name = 'Honda' THEN '₹8.50L - ₹9.50L'
        WHEN b.brand_name = 'Yamaha' THEN '₹1.80L - ₹1.90L'
        WHEN b.brand_name = 'Hero' THEN '₹70K - ₹80K'
        WHEN b.brand_name = 'Bajaj' THEN '₹1.40L - ₹1.50L'
        WHEN b.brand_name = 'Royal Enfield' THEN '₹1.90L - ₹2.10L'
    END as price_range,
    CURRENT_DATE + INTERVAL '30 days' as expected_launch,
    CASE 
        WHEN b.brand_name IN ('Honda', 'Royal Enfield') THEN CURRENT_DATE - INTERVAL '7 days'
        ELSE NULL
    END as launch_date
FROM variants v
JOIN models m ON v.model_id = m.model_id
JOIN brands b ON v.brand_id = b.brand_id;

-- 7. Sample Images Data
INSERT INTO images (variant_id, url, alt_text)
SELECT 
    v.variant_id,
    CASE 
        WHEN b.brand_name = 'Honda' THEN 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/variant_image/honda-cbr-650r.jpg'
        WHEN b.brand_name = 'Yamaha' THEN 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/variant_image/yamaha-r15-v4.jpg'
        WHEN b.brand_name = 'Hero' THEN 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/variant_image/hero-splendor-plus.jpg'
        WHEN b.brand_name = 'Bajaj' THEN 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/variant_image/bajaj-pulsar-ns200.jpg'
        WHEN b.brand_name = 'Royal Enfield' THEN 'https://bikersalliance.supabase.co/storage/v1/object/public/bikeralliance/variant_image/royal-enfield-classic-350.jpg'
    END as url,
    CONCAT(b.brand_name, ' ', m.model_name, ' - ', v.variant_name) as alt_text
FROM variants v
JOIN models m ON v.model_id = m.model_id
JOIN brands b ON v.brand_id = b.brand_id;

-- 8. Sample Newsletter Subscriptions
INSERT INTO newsletter_subscriptions (email, status) 
VALUES 
    ('user1@example.com', 'active'),
    ('user2@example.com', 'active'),
    ('user3@example.com', 'unsubscribed'),
    ('user4@example.com', 'active'),
    ('user5@example.com', 'active');

-- 9. Sample Users Data
INSERT INTO users (full_name, email, password_hash, phone) 
VALUES 
    ('John Doe', 'john@example.com', '$2b$10$hashedpassword1', '+91-9876543211'),
    ('Jane Smith', 'jane@example.com', '$2b$10$hashedpassword2', '+91-9876543212'),
    ('Mike Johnson', 'mike@example.com', '$2b$10$hashedpassword3', '+91-9876543213'),
    ('Sarah Wilson', 'sarah@example.com', '$2b$10$hashedpassword4', '+91-9876543214'),
    ('David Brown', 'david@example.com', '$2b$10$hashedpassword5', '+91-9876543215');

-- 10. Sample Dealers Data
INSERT INTO dealers (name, address, city, state, pincode, phone, email) 
VALUES 
    ('Honda Showroom Delhi', '123 MG Road', 'New Delhi', 'Delhi', '110001', '+91-11-12345678', 'honda.delhi@example.com'),
    ('Yamaha Center Mumbai', '456 Marine Drive', 'Mumbai', 'Maharashtra', '400001', '+91-22-87654321', 'yamaha.mumbai@example.com'),
    ('Hero Dealership Bangalore', '789 Brigade Road', 'Bangalore', 'Karnataka', '560001', '+91-80-11223344', 'hero.bangalore@example.com'),
    ('Bajaj Showroom Chennai', '321 Anna Salai', 'Chennai', 'Tamil Nadu', '600001', '+91-44-55667788', 'bajaj.chennai@example.com'),
    ('Royal Enfield Store Pune', '654 FC Road', 'Pune', 'Maharashtra', '411001', '+91-20-99887766', 're.pune@example.com');

-- 11. Sample Bookings Data
INSERT INTO bookings (user_id, variant_id, dealer_id, booking_date, status, price, notes)
SELECT 
    u.user_id,
    v.variant_id,
    d.dealer_id,
    CURRENT_DATE - INTERVAL '5 days',
    'confirmed',
    v.on_road_price,
    'Customer confirmed booking and paid advance'
FROM users u
CROSS JOIN variants v
CROSS JOIN dealers d
WHERE u.email = 'john@example.com' 
  AND v.variant_name LIKE '%Honda%'
  AND d.name LIKE '%Honda%'
LIMIT 1;

-- 12. Sample Reviews Data  
INSERT INTO reviews (variant_id, user_id, rating, title, body)
SELECT 
    v.variant_id,
    u.user_id,
    5,
    'Excellent Performance!',
    'Amazing bike with great performance and fuel efficiency. Highly recommended for city riding.'
FROM variants v
CROSS JOIN users u
WHERE v.variant_name LIKE '%Splendor%'
  AND u.email = 'jane@example.com'
LIMIT 1;

-- 13. Sample Favourites Data
INSERT INTO favourites (user_id, variant_id)
SELECT 
    u.user_id,
    v.variant_id
FROM users u
CROSS JOIN variants v
WHERE u.email IN ('john@example.com', 'jane@example.com')
  AND v.variant_name IN ('CBR 650R Standard', 'R15 V4 Racing Blue')
LIMIT 4;

-- 14. Sample Comparisons Data
INSERT INTO comparisons (user_id, variant_id_1, variant_id_2)
SELECT 
    u.user_id,
    v1.variant_id as variant_id_1,
    v2.variant_id as variant_id_2
FROM users u
CROSS JOIN variants v1
CROSS JOIN variants v2
WHERE u.email = 'mike@example.com'
  AND v1.variant_name = 'CBR 650R Standard'
  AND v2.variant_name = 'R15 V4 Racing Blue'
LIMIT 1;

-- ==============================================
-- RLS Policy Examples
-- ==============================================

-- Admin policies for brands table
CREATE POLICY "Admins can view all brands" ON brands
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin 
            WHERE id = auth.uid()::uuid 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can insert brands" ON brands
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin 
            WHERE id = auth.uid()::uuid 
            AND is_active = true
            AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Admins can update brands" ON brands
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin 
            WHERE id = auth.uid()::uuid 
            AND is_active = true
            AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admins can delete brands" ON brands
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin 
            WHERE id = auth.uid()::uuid 
            AND is_active = true
            AND role = 'super_admin'
        )
    );

-- ==============================================
-- Useful Queries for Admin Panel
-- ==============================================

-- 1. Get brand with model count
SELECT 
    b.*,
    COUNT(m.model_id) as model_count
FROM brands b
LEFT JOIN models m ON b.brand_id = m.brand_id
GROUP BY b.brand_id
ORDER BY b.created_at DESC;

-- 2. Get variant with all related data
SELECT 
    v.*,
    b.brand_name,
    m.model_name,
    s.engine_type,
    s.displacement,
    s.max_power,
    COUNT(i.image_id) as image_count
FROM variants v
JOIN brands b ON v.brand_id = b.brand_id
JOIN models m ON v.model_id = m.model_id
LEFT JOIN specs s ON v.variant_id = s.variant_id
LEFT JOIN images i ON v.variant_id = i.variant_id
GROUP BY v.variant_id, b.brand_name, m.model_name, s.engine_type, s.displacement, s.max_power
ORDER BY v.created_at DESC;

-- 3. Get booking statistics
SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
    SUM(price) as total_value
FROM bookings
WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days';

-- 4. Get popular variants (most booked)
SELECT 
    v.variant_name,
    b.brand_name,
    m.model_name,
    COUNT(bk.booking_id) as booking_count,
    AVG(r.rating) as avg_rating
FROM variants v
JOIN brands b ON v.brand_id = b.brand_id
JOIN models m ON v.model_id = m.model_id
LEFT JOIN bookings bk ON v.variant_id = bk.variant_id
LEFT JOIN reviews r ON v.variant_id = r.variant_id
GROUP BY v.variant_id, v.variant_name, b.brand_name, m.model_name
ORDER BY booking_count DESC
LIMIT 10;

-- 5. Get admin activity summary
SELECT 
    a.name,
    a.role,
    COUNT(al.id) as total_actions,
    COUNT(CASE WHEN al.action = 'CREATE' THEN 1 END) as create_actions,
    COUNT(CASE WHEN al.action = 'UPDATE' THEN 1 END) as update_actions,
    COUNT(CASE WHEN al.action = 'DELETE' THEN 1 END) as delete_actions,
    MAX(al.created_at) as last_activity
FROM admin a
LEFT JOIN admin_audit_log al ON a.id = al.admin_id
WHERE a.is_active = true
GROUP BY a.id, a.name, a.role
ORDER BY total_actions DESC;