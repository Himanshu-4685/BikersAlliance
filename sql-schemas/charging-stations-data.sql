-- Insert charging station data
INSERT INTO public.charging_stations (
    id, name, slug, location, address, city, state, phone, email,
    timing, connector_types, charging_speed, status, pricing, amenities,
    latitude, longitude, description, operator, capacity, power_output
) VALUES 
-- Shell Recharge Delhi
(
    gen_random_uuid(), 'Shell Recharge Delhi', 'shell-recharge-delhi',
    'Connaught Place, New Delhi', 'Shop No. 12, Connaught Place, New Delhi - 110001',
    'New Delhi', 'Delhi', '+91 9876543210', 'delhi@shellrecharge.com',
    '24 Hours', '["Type 2", "CCS", "CHAdeMO"]'::jsonb,
    '50kW', 'Available', '₹12/kWh', '["Parking", "Restroom", "Cafe"]'::jsonb,
    28.6315, 77.2167,
    'High-speed charging station in the heart of Delhi with premium amenities.',
    'Shell India', 4, '50kW DC Fast Charging'
),

-- Tata Power EZ Charge
(
    gen_random_uuid(), 'Tata Power EZ Charge', 'tata-power-ez-charge-mumbai',
    'Bandra West, Mumbai', 'Linking Road, Bandra West, Mumbai - 400050',
    'Mumbai', 'Maharashtra', '+91 9876543211', 'mumbai@tatapower.com',
    '6 AM - 11 PM', '["Type 2", "CCS"]'::jsonb,
    '22kW', 'Available', '₹10/kWh', '["Parking", "Shopping Mall"]'::jsonb,
    19.0544, 72.8266,
    'Convenient charging station located in popular shopping area of Mumbai.',
    'Tata Power', 3, '22kW AC Charging'
),

-- Ather Grid Charging
(
    gen_random_uuid(), 'Ather Grid Charging', 'ather-grid-charging-bangalore',
    'Electronic City, Bangalore', 'Electronic City Phase 1, Bangalore - 560100',
    'Bangalore', 'Karnataka', '+91 9876543212', 'bangalore@atherenergy.com',
    '24 Hours', '["Type 2", "Ather Connector"]'::jsonb,
    '6kW', 'Occupied', '₹8/kWh', '["Parking", "Cafe", "Security"]'::jsonb,
    12.8456, 77.6603,
    'Ather''s proprietary charging network providing reliable charging for electric scooters.',
    'Ather Energy', 2, '6kW AC Charging'
),

-- Hero Electric Station
(
    gen_random_uuid(), 'Hero Electric Station', 'hero-electric-station-chennai',
    'Anna Salai, Chennai', 'Anna Salai, Chennai - 600002',
    'Chennai', 'Tamil Nadu', '+91 9876543213', 'chennai@heroelectric.com',
    '7 AM - 10 PM', '["Type 2", "Standard"]'::jsonb,
    '15kW', 'Available', '₹9/kWh', '["Parking", "Restroom"]'::jsonb,
    13.0827, 80.2707,
    'Hero Electric''s charging station supporting various electric two-wheelers.',
    'Hero Electric', 3, '15kW Fast Charging'
),

-- BPCL Charge Zone
(
    gen_random_uuid(), 'BPCL Charge Zone', 'bpcl-charge-zone-hyderabad',
    'Gachibowli, Hyderabad', 'HITEC City, Gachibowli, Hyderabad - 500032',
    'Hyderabad', 'Telangana', '+91 9876543214', 'hyderabad@bpcl.co.in',
    '24 Hours', '["Type 2", "CCS", "CHAdeMO"]'::jsonb,
    '60kW', 'Available', '₹15/kWh', '["Parking", "Restroom", "Security", "Cafe"]'::jsonb,
    17.4399, 78.3908,
    'High-capacity charging station in Hyderabad''s IT corridor with premium facilities.',
    'Bharat Petroleum', 4, '60kW DC Ultra Fast Charging'
),

-- Fortum Charge Drive
(
    gen_random_uuid(), 'Fortum Charge Drive', 'fortum-charge-drive-gurgaon',
    'Sector 62, Gurgaon', 'Cyber City, Sector 62, Gurgaon - 122102',
    'Gurgaon', 'Haryana', '+91 9876543215', 'gurgaon@fortum.com',
    '24 Hours', '["Type 2", "CCS"]'::jsonb,
    '50kW', 'Available', '₹13/kWh', '["Parking", "Security", "Office Complex"]'::jsonb,
    28.4089, 77.0687,
    'Premium charging station in Gurgaon''s business district with corporate facilities.',
    'Fortum India', 3, '50kW DC Fast Charging'
);