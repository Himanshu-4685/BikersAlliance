-- Query to get all bike offer leads with formatted data
-- Use this in Supabase dashboard or your admin panel

-- Get all leads ordered by latest first
SELECT 
  id,
  name,
  email,
  mobile,
  bike_name,
  dealer_name,
  offer_title,
  offer_price,
  original_price,
  discount_percent,
  status,
  created_at,
  updated_at
FROM bike_offer_leads 
ORDER BY created_at DESC;

-- Get leads count by status
SELECT 
  status,
  COUNT(*) as count
FROM bike_offer_leads
GROUP BY status
ORDER BY count DESC;

-- Get recent leads (last 7 days)
SELECT 
  id,
  name,
  email,
  mobile,
  bike_name,
  offer_title,
  status,
  created_at
FROM bike_offer_leads 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Get leads by bike
SELECT 
  bike_name,
  COUNT(*) as lead_count,
  AVG(offer_price) as avg_price
FROM bike_offer_leads
GROUP BY bike_name
ORDER BY lead_count DESC;

-- Update lead status (example)
-- UPDATE bike_offer_leads 
-- SET status = 'contacted', notes = 'Called customer, interested in test drive'
-- WHERE id = 'your-lead-id-here';