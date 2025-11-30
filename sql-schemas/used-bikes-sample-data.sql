-- Insert 50 used bikes sample data across major Indian cities
-- This script will populate the used_bikes table with realistic bike listings

INSERT INTO public.used_bikes (
  brand, model, variant, year, category, fuel_type, transmission, km_driven, ownership,
  expected_price, condition, description, owner_name, email, phone, city, state,
  has_rc, has_insurance, has_puc, status, verified, featured
) VALUES 

-- Mumbai, Maharashtra
('Honda', 'Activa 6G', 'Standard', 2022, 'Scooter', 'Petrol', 'CVT', 12000, 'First Owner',
65000, 'Good', 'Well maintained Honda Activa 6G, single owner, all papers clear. Perfect for city commute.',
'Rahul Sharma', 'rahul.sharma@gmail.com', '+91 9876543210', 'Mumbai', 'Maharashtra',
true, true, true, 'approved', true, false),

('Royal Enfield', 'Classic 350', 'Standard', 2021, 'Cruiser', 'Petrol', 'Manual', 8500, 'First Owner',
145000, 'Excellent', 'Like new Royal Enfield Classic 350, barely used, garage kept.',
'Priya Singh', 'priya.singh@gmail.com', '+91 8765432109', 'Mumbai', 'Maharashtra',
true, true, true, 'approved', true, true),

('Bajaj', 'Pulsar NS200', 'Standard', 2020, 'Sport', 'Petrol', 'Manual', 25000, 'Second Owner',
85000, 'Good', 'Powerful Pulsar NS200, well maintained, new tyres recently fitted.',
'Amit Patel', 'amit.patel@yahoo.com', '+91 9234567890', 'Mumbai', 'Maharashtra',
true, true, false, 'approved', false, false),

-- Delhi, Delhi
('Hero', 'Splendor Plus', 'Standard', 2023, 'Commuter', 'Petrol', 'Manual', 5000, 'First Owner',
55000, 'Excellent', 'Almost new Hero Splendor Plus, excellent mileage, perfect for daily commute.',
'Vikash Kumar', 'vikash.kumar@hotmail.com', '+91 8123456789', 'Delhi', 'Delhi',
true, true, true, 'approved', true, false),

('Yamaha', 'FZ S', 'Version 3.0', 2019, 'Street', 'Petrol', 'Manual', 18000, 'First Owner',
78000, 'Good', 'Stylish Yamaha FZ S, single owner, well maintained with service records.',
'Anjali Gupta', 'anjali.gupta@gmail.com', '+91 7987654321', 'Delhi', 'Delhi',
true, true, true, 'approved', false, false),

('Honda', 'CB Shine', 'Standard', 2021, 'Commuter', 'Petrol', 'Manual', 15000, 'First Owner',
62000, 'Good', 'Reliable Honda CB Shine, excellent condition, all documents ready.',
'Suresh Agarwal', 'suresh.agarwal@gmail.com', '+91 9876123450', 'Delhi', 'Delhi',
true, true, true, 'approved', true, false),

-- Bangalore, Karnataka
('TVS', 'Apache RTR 160 4V', 'Standard', 2022, 'Sport', 'Petrol', 'Manual', 8000, 'First Owner',
95000, 'Excellent', 'TVS Apache RTR 160 4V in mint condition, racing inspired design.',
'Karthik Reddy', 'karthik.reddy@techmail.com', '+91 8765123409', 'Bangalore', 'Karnataka',
true, true, true, 'approved', true, true),

('Honda', 'Dio', 'Standard', 2020, 'Scooter', 'Petrol', 'CVT', 22000, 'Second Owner',
48000, 'Fair', 'Honda Dio scooter, good for city rides, minor scratches but mechanically sound.',
'Sneha Nair', 'sneha.nair@gmail.com', '+91 9123456780', 'Bangalore', 'Karnataka',
true, false, true, 'approved', false, false),

('KTM', 'Duke 200', 'Standard', 2021, 'Naked', 'Petrol', 'Manual', 12000, 'First Owner',
125000, 'Good', 'KTM Duke 200 with aggressive styling, ready to rock, well maintained.',
'Arjun Krishnan', 'arjun.krishnan@outlook.com', '+91 8567123490', 'Bangalore', 'Karnataka',
true, true, true, 'approved', true, false),

-- Chennai, Tamil Nadu
('TVS', 'Jupiter', 'Standard', 2023, 'Scooter', 'Petrol', 'CVT', 3000, 'First Owner',
68000, 'Excellent', 'Brand new TVS Jupiter, barely used, excellent fuel efficiency.',
'Ravi Shankar', 'ravi.shankar@gmail.com', '+91 9345678901', 'Chennai', 'Tamil Nadu',
true, true, true, 'approved', true, true),

('Bajaj', 'Platina 110', 'H-Gear', 2022, 'Commuter', 'Petrol', 'Manual', 10000, 'First Owner',
52000, 'Good', 'Bajaj Platina with H-Gear, comfortable for long rides, excellent mileage.',
'Meera Lakshmi', 'meera.lakshmi@yahoo.com', '+91 8234567891', 'Chennai', 'Tamil Nadu',
true, true, true, 'approved', false, false),

('Royal Enfield', 'Bullet 350', 'Standard', 2018, 'Cruiser', 'Petrol', 'Manual', 35000, 'Second Owner',
98000, 'Fair', 'Classic Royal Enfield Bullet 350, vintage charm, some restoration done.',
'Ganesh Murugan', 'ganesh.murugan@gmail.com', '+91 9876234501', 'Chennai', 'Tamil Nadu',
true, true, false, 'approved', false, false),

-- Hyderabad, Telangana
('Honda', 'Activa 125', 'BS6', 2021, 'Scooter', 'Petrol', 'CVT', 16000, 'First Owner',
58000, 'Good', 'Honda Activa 125 BS6, reliable and fuel efficient, perfect for daily use.',
'Srinivas Rao', 'srinivas.rao@techcorp.com', '+91 8765432198', 'Hyderabad', 'Telangana',
true, true, true, 'approved', true, false),

('Hero', 'Xtreme 200R', 'Standard', 2020, 'Sport', 'Petrol', 'Manual', 20000, 'First Owner',
82000, 'Good', 'Hero Xtreme 200R, sporty design with good performance, well maintained.',
'Lakshmi Devi', 'lakshmi.devi@gmail.com', '+91 9123876540', 'Hyderabad', 'Telangana',
true, true, true, 'approved', false, false),

('Yamaha', 'Ray ZR', 'Street Rally', 2022, 'Scooter', 'Petrol', 'CVT', 7000, 'First Owner',
72000, 'Excellent', 'Yamaha Ray ZR Street Rally edition, sporty scooter in excellent condition.',
'Rajesh Chandra', 'rajesh.chandra@hotmail.com', '+91 8567432109', 'Hyderabad', 'Telangana',
true, true, true, 'approved', true, false),

-- Pune, Maharashtra
('Bajaj', 'Avenger Cruise 220', 'Standard', 2019, 'Cruiser', 'Petrol', 'Manual', 28000, 'First Owner',
95000, 'Good', 'Bajaj Avenger Cruise 220, comfortable cruiser for long rides.',
'Aarti Joshi', 'aarti.joshi@pune.edu', '+91 9876543120', 'Pune', 'Maharashtra',
true, true, false, 'approved', false, false),

('Honda', 'Unicorn 150', 'CBS', 2021, 'Commuter', 'Petrol', 'Manual', 14000, 'First Owner',
68000, 'Good', 'Honda Unicorn 150 with CBS, smooth engine, excellent for city and highway.',
'Nikhil Patil', 'nikhil.patil@gmail.com', '+91 8234567812', 'Pune', 'Maharashtra',
true, true, true, 'approved', true, false),

('TVS', 'Ntorq 125', 'Race Edition', 2020, 'Scooter', 'Petrol', 'CVT', 18000, 'First Owner',
65000, 'Good', 'TVS Ntorq 125 Race Edition, feature-loaded scooter with Bluetooth connectivity.',
'Pooja Kulkarni', 'pooja.kulkarni@yahoo.com', '+91 9345612780', 'Pune', 'Maharashtra',
true, true, true, 'approved', true, true),

-- Kolkata, West Bengal
('Hero', 'Passion Pro', 'i3S', 2022, 'Commuter', 'Petrol', 'Manual', 9000, 'First Owner',
58000, 'Excellent', 'Hero Passion Pro with i3S technology, fuel efficient and reliable.',
'Subrata Das', 'subrata.das@kolkata.com', '+91 8765123489', 'Kolkata', 'West Bengal',
true, true, true, 'approved', false, false),

('Yamaha', 'Fascino 125', 'Hybrid', 2023, 'Scooter', 'Petrol', 'CVT', 4000, 'First Owner',
75000, 'Excellent', 'Yamaha Fascino 125 Hybrid, latest model with hybrid technology.',
'Rima Chatterjee', 'rima.chatterjee@gmail.com', '+91 9123456871', 'Kolkata', 'West Bengal',
true, true, true, 'approved', true, true),

('Bajaj', 'CT 110', 'Standard', 2021, 'Commuter', 'Petrol', 'Manual', 17000, 'First Owner',
45000, 'Good', 'Bajaj CT 110, basic but reliable commuter bike, good mileage.',
'Amit Ghosh', 'amit.ghosh@webmail.com', '+91 8567890123', 'Kolkata', 'West Bengal',
true, true, true, 'approved', false, false),

-- Ahmedabad, Gujarat
('Hero', 'Maestro Edge 125', 'Standard', 2020, 'Scooter', 'Petrol', 'CVT', 21000, 'Second Owner',
52000, 'Fair', 'Hero Maestro Edge 125, decent condition, good for city commute.',
'Harsh Modi', 'harsh.modi@ahmedabad.org', '+91 9876123457', 'Ahmedabad', 'Gujarat',
true, false, true, 'approved', false, false),

('Honda', 'Hornet 2.0', 'Standard', 2022, 'Naked', 'Petrol', 'Manual', 6000, 'First Owner',
118000, 'Excellent', 'Honda Hornet 2.0, powerful naked bike, almost new condition.',
'Kavya Shah', 'kavya.shah@gmail.com', '+91 8234561789', 'Ahmedabad', 'Gujarat',
true, true, true, 'approved', true, true),

('TVS', 'Radeon', 'Standard', 2021, 'Commuter', 'Petrol', 'Manual', 13000, 'First Owner',
48000, 'Good', 'TVS Radeon, comfortable commuter with good features and mileage.',
'Jigar Patel', 'jigar.patel@yahoo.com', '+91 9345671289', 'Ahmedabad', 'Gujarat',
true, true, true, 'approved', false, false),

-- Jaipur, Rajasthan
('Royal Enfield', 'Himalayan', 'Standard', 2020, 'Adventure', 'Petrol', 'Manual', 24000, 'First Owner',
165000, 'Good', 'Royal Enfield Himalayan, perfect for adventure touring, well maintained.',
'Vikram Singh', 'vikram.singh@rajasthan.gov', '+91 8765432187', 'Jaipur', 'Rajasthan',
true, true, true, 'approved', true, true),

('Hero', 'Glamour', 'i3S', 2023, 'Commuter', 'Petrol', 'Manual', 2000, 'First Owner',
68000, 'Excellent', 'Hero Glamour with i3S, brand new bike, barely used.',
'Priyanka Sharma', 'priyanka.sharma@jaipur.edu', '+91 9123478560', 'Jaipur', 'Rajasthan',
true, true, true, 'approved', true, false),

('Bajaj', 'Dominar 250', 'Standard', 2021, 'Touring', 'Petrol', 'Manual', 15000, 'First Owner',
135000, 'Good', 'Bajaj Dominar 250, great for touring and long rides, comfortable seating.',
'Rohit Meena', 'rohit.meena@hotmail.com', '+91 8567123478', 'Jaipur', 'Rajasthan',
true, true, false, 'approved', false, false),

-- Lucknow, Uttar Pradesh
('Honda', 'SP 125', 'Drum', 2022, 'Commuter', 'Petrol', 'Manual', 11000, 'First Owner',
62000, 'Good', 'Honda SP 125, reliable commuter with good build quality and mileage.',
'Ankit Verma', 'ankit.verma@lucknow.com', '+91 9876543178', 'Lucknow', 'Uttar Pradesh',
true, true, true, 'approved', false, false),

('TVS', 'Zest 110', 'Standard', 2020, 'Scooter', 'Petrol', 'CVT', 19000, 'First Owner',
42000, 'Fair', 'TVS Zest 110, basic scooter for daily commute, fair condition.',
'Sunita Singh', 'sunita.singh@gmail.com', '+91 8234567198', 'Lucknow', 'Uttar Pradesh',
true, true, true, 'approved', false, false),

('Yamaha', 'MT-15', 'Version 2.0', 2021, 'Naked', 'Petrol', 'Manual', 13000, 'First Owner',
128000, 'Good', 'Yamaha MT-15 Version 2.0, aggressive naked bike with excellent performance.',
'Shivam Gupta', 'shivam.gupta@outlook.com', '+91 9345612789', 'Lucknow', 'Uttar Pradesh',
true, true, true, 'approved', true, false),

-- Chandigarh, Chandigarh
('Hero', 'XPulse 200', 'Standard', 2020, 'Adventure', 'Petrol', 'Manual', 22000, 'First Owner',
98000, 'Good', 'Hero XPulse 200, adventure bike with off-road capabilities.',
'Manpreet Kaur', 'manpreet.kaur@chandigarh.gov', '+91 8765431289', 'Chandigarh', 'Chandigarh',
true, true, true, 'approved', true, false),

('Honda', 'Grazia 125', 'Standard', 2021, 'Scooter', 'Petrol', 'CVT', 16000, 'First Owner',
68000, 'Good', 'Honda Grazia 125, stylish scooter with good features and comfort.',
'Simran Bhalla', 'simran.bhalla@yahoo.com', '+91 9123456789', 'Chandigarh', 'Chandigarh',
true, true, true, 'approved', false, false),

-- Indore, Madhya Pradesh
('Bajaj', 'Pulsar 150', 'Neon', 2022, 'Sport', 'Petrol', 'Manual', 8000, 'First Owner',
88000, 'Good', 'Bajaj Pulsar 150 Neon, sporty bike with LED lighting and good performance.',
'Deepak Jain', 'deepak.jain@indore.org', '+91 8567891234', 'Indore', 'Madhya Pradesh',
true, true, true, 'approved', true, false),

('TVS', 'Pep Plus', 'Standard', 2019, 'Scooter', 'Petrol', 'CVT', 25000, 'Second Owner',
35000, 'Fair', 'TVS Pep Plus, old but reliable scooter, good for basic transportation.',
'Rekha Agrawal', 'rekha.agrawal@gmail.com', '+91 9876234517', 'Indore', 'Madhya Pradesh',
true, false, false, 'approved', false, false),

-- Bhubaneswar, Odisha
('Hero', 'Super Splendor', 'Standard', 2021, 'Commuter', 'Petrol', 'Manual', 14000, 'First Owner',
65000, 'Good', 'Hero Super Splendor, premium commuter with good features and comfort.',
'Bikash Panda', 'bikash.panda@bhubaneswar.com', '+91 8234567890', 'Bhubaneswar', 'Odisha',
true, true, true, 'approved', false, false),

('Honda', 'Livo', 'Standard', 2020, 'Commuter', 'Petrol', 'Manual', 18000, 'First Owner',
52000, 'Good', 'Honda Livo, reliable commuter bike with Honda quality and service.',
'Sujata Mohanty', 'sujata.mohanty@yahoo.com', '+91 9345678912', 'Bhubaneswar', 'Odisha',
true, true, true, 'approved', false, false),

-- Guwahati, Assam
('Yamaha', 'Saluto RX', 'Standard', 2019, 'Commuter', 'Petrol', 'Manual', 28000, 'Second Owner',
48000, 'Fair', 'Yamaha Saluto RX, decent commuter bike, fair condition with some wear.',
'Pranab Borah', 'pranab.borah@guwahati.edu', '+91 8765432190', 'Guwahati', 'Assam',
true, false, true, 'approved', false, false),

('Hero', 'Destini 125', 'Standard', 2022, 'Scooter', 'Petrol', 'CVT', 12000, 'First Owner',
62000, 'Good', 'Hero Destini 125, comfortable family scooter with good features.',
'Archana Das', 'archana.das@gmail.com', '+91 9123456780', 'Guwahati', 'Assam',
true, true, true, 'approved', true, false),

-- Kochi, Kerala
('TVS', 'Star City Plus', 'Standard', 2020, 'Commuter', 'Petrol', 'Manual', 20000, 'First Owner',
54000, 'Good', 'TVS Star City Plus, reliable commuter with good mileage and comfort.',
'Ravi Nair', 'ravi.nair@kochi.com', '+91 8567123490', 'Kochi', 'Kerala',
true, true, true, 'approved', false, false),

('Honda', 'Shine SP', 'CBS', 2021, 'Commuter', 'Petrol', 'Manual', 15000, 'First Owner',
68000, 'Good', 'Honda Shine SP with CBS, smooth engine and excellent build quality.',
'Maya Pillai', 'maya.pillai@outlook.com', '+91 9876543210', 'Kochi', 'Kerala',
true, true, true, 'approved', true, false),

-- Coimbatore, Tamil Nadu
('Bajaj', 'V15', 'Standard', 2018, 'Commuter', 'Petrol', 'Manual', 32000, 'Second Owner',
68000, 'Fair', 'Bajaj V15, unique bike made from INS Vikrant steel, decent condition.',
'Murugan Selvam', 'murugan.selvam@coimbatore.org', '+91 8234567891', 'Coimbatore', 'Tamil Nadu',
true, false, false, 'approved', false, false),

('TVS', 'Wego', 'Standard', 2021, 'Scooter', 'Petrol', 'CVT', 17000, 'First Owner',
58000, 'Good', 'TVS Wego, family scooter with good comfort and fuel efficiency.',
'Kamala Devi', 'kamala.devi@yahoo.com', '+91 9345612780', 'Coimbatore', 'Tamil Nadu',
true, true, true, 'approved', false, false),

-- Visakhapatnam, Andhra Pradesh
('Hero', 'Karizma XMR', 'Standard', 2019, 'Sport Touring', 'Petrol', 'Manual', 26000, 'First Owner',
125000, 'Good', 'Hero Karizma XMR, sport touring bike with comfortable riding position.',
'Prasad Rao', 'prasad.rao@vizag.com', '+91 8765432189', 'Visakhapatnam', 'Andhra Pradesh',
true, true, false, 'approved', false, false),

('Honda', 'Cliq', 'Standard', 2020, 'Scooter', 'Petrol', 'CVT', 22000, 'Second Owner',
42000, 'Fair', 'Honda Cliq, compact scooter for city use, fair condition with regular service.',
'Swathi Reddy', 'swathi.reddy@gmail.com', '+91 9123456781', 'Visakhapatnam', 'Andhra Pradesh',
true, false, true, 'approved', false, false),

-- Nagpur, Maharashtra
('Bajaj', 'Discover 125', 'ST', 2022, 'Commuter', 'Petrol', 'Manual', 10000, 'First Owner',
58000, 'Good', 'Bajaj Discover 125 ST, comfortable commuter with good features.',
'Sachin Kale', 'sachin.kale@nagpur.edu', '+91 8567890124', 'Nagpur', 'Maharashtra',
true, true, true, 'approved', false, false),

('TVS', 'Scooty Zest', 'Standard', 2019, 'Scooter', 'Petrol', 'CVT', 24000, 'First Owner',
38000, 'Fair', 'TVS Scooty Zest, basic scooter for ladies, fair condition.',
'Nisha Joshi', 'nisha.joshi@yahoo.com', '+91 9876234518', 'Nagpur', 'Maharashtra',
true, true, true, 'approved', false, false),

-- Vadodara, Gujarat
('Hero', 'Hunk', 'Standard', 2018, 'Sport', 'Petrol', 'Manual', 35000, 'Second Owner',
58000, 'Fair', 'Hero Hunk, sporty commuter with muscular design, fair condition.',
'Kiran Patel', 'kiran.patel@vadodara.com', '+91 8234567892', 'Vadodara', 'Gujarat',
true, false, false, 'approved', false, false),

('Honda', 'Dream Yuga', 'Standard', 2021, 'Commuter', 'Petrol', 'Manual', 16000, 'First Owner',
55000, 'Good', 'Honda Dream Yuga, fuel efficient commuter with Honda reliability.',
'Bhavna Modi', 'bhavna.modi@gmail.com', '+91 9345671890', 'Vadodara', 'Gujarat',
true, true, true, 'approved', true, false),

-- Goa, Goa
('Yamaha', 'Aerox 155', 'Standard', 2022, 'Maxi Scooter', 'Petrol', 'CVT', 5000, 'First Owner',
128000, 'Excellent', 'Yamaha Aerox 155, premium maxi scooter, perfect for Goa roads.',
'Carlos D''Souza', 'carlos.dsouza@goa.com', '+91 8765431290', 'Panaji', 'Goa',
true, true, true, 'approved', true, true),

('TVS', 'iQube Electric', 'Standard', 2023, 'Electric Scooter', 'Electric', 'Automatic', 3000, 'First Owner',
95000, 'Excellent', 'TVS iQube Electric, eco-friendly electric scooter, almost new.',
'Maria Fernandes', 'maria.fernandes@outlook.com', '+91 9123456782', 'Panaji', 'Goa',
true, true, true, 'approved', true, true),

-- Thiruvananthapuram, Kerala
('Royal Enfield', 'Meteor 350', 'Fireball', 2021, 'Cruiser', 'Petrol', 'Manual', 18000, 'First Owner',
158000, 'Good', 'Royal Enfield Meteor 350 Fireball, modern classic with comfortable ergonomics.',
'Arun Kumar', 'arun.kumar@trivandrum.gov', '+91 8567123491', 'Thiruvananthapuram', 'Kerala',
true, true, true, 'approved', true, false),

('Hero', 'Pleasure Plus', 'Standard', 2020, 'Scooter', 'Petrol', 'CVT', 19000, 'First Owner',
52000, 'Good', 'Hero Pleasure Plus, stylish scooter designed for women, good condition.',
'Divya Nair', 'divya.nair@gmail.com', '+91 9876543211', 'Thiruvananthapuram', 'Kerala',
true, true, true, 'approved', false, false);

-- Update the created_at timestamps to be more realistic (spread over the last 6 months)
UPDATE public.used_bikes 
SET created_at = NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 180)
WHERE created_at >= NOW() - INTERVAL '1 minute';

-- Update some bikes to have different statuses for variety
UPDATE public.used_bikes SET status = 'pending', verified = false WHERE id IN (
  SELECT id FROM public.used_bikes WHERE status = 'approved' ORDER BY RANDOM() LIMIT 8
);

UPDATE public.used_bikes SET status = 'sold', sold_at = NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30) WHERE id IN (
  SELECT id FROM public.used_bikes WHERE status = 'approved' ORDER BY RANDOM() LIMIT 5
);

-- Add some sample photos JSON for featured bikes
UPDATE public.used_bikes 
SET photos = '[
  "https://example.com/bike1-front.jpg",
  "https://example.com/bike1-side.jpg",
  "https://example.com/bike1-rear.jpg"
]'::jsonb
WHERE featured = true;

-- Add admin notes for some bikes
UPDATE public.used_bikes 
SET admin_notes = CASE 
  WHEN status = 'pending' THEN 'Waiting for document verification'
  WHEN status = 'sold' THEN 'Successfully sold through our platform'
  WHEN featured = true THEN 'Premium listing - excellent condition'
  ELSE NULL
END
WHERE status IN ('pending', 'sold') OR featured = true;