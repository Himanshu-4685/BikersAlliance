# Troubleshooting API Issues

## Current Status
✅ **Database table created** - Status table exists with data  
❌ **API failing** - "Failed to fetch bikes" error  
✅ **Fallback working** - Website shows hardcoded data  

## Steps to Fix

### Step 1: Add Service Role Key
1. Go to https://supabase.com/dashboard
2. Select your project: `csvzysxiuuzcsmpknehi`
3. Go to **Settings** → **API**
4. Copy the **service_role** key (NOT the anon key)
5. Replace `YOUR_SERVICE_ROLE_KEY_HERE` in `.env.local` with the actual key

### Step 2: Disable RLS (Temporarily)
1. Go to **SQL Editor** in Supabase dashboard
2. Run the SQL from `sql-schemas/disable-rls-for-testing.sql`
3. This disables Row Level Security for testing

### Step 3: Test API Connection
1. Visit: http://localhost:3000/api/test-db
2. Should show table data and connection status
3. Visit: http://localhost:3000/api/bike-status?status=upcoming
4. Should show your status table data

### Step 4: Verify Data
Check your status table has:
- Correct `brand_id` values that exist in `brands` table
- Correct `model_id` values that exist in `models` table  
- Correct `variant_id` values that exist in `variants` table

### Step 5: Add Missing Data (If needed)
You may need to add corresponding records in:
```sql
-- Add to brands table
INSERT INTO brands (brand_id, brand_name, logo_url) 
VALUES ('your-brand-id', 'Brand Name', '/demo.avif');

-- Add to models table  
INSERT INTO models (model_id, brand_id, model_name)
VALUES (your-model-id, 'your-brand-id', 'Model Name');

-- Add to variants table
INSERT INTO variants (variant_id, model_id, brand_id, variant_name, url)
VALUES (your-variant-id, your-model-id, 'your-brand-id', 'Variant Name', 'bike-slug');

-- Add images (optional)
INSERT INTO images (variant_id, url, alt_text)
VALUES (your-variant-id, '/demo.avif', 'Bike Image');

-- Add specs (for new_launch status)
INSERT INTO specs (variant_id, displacement, peak_power, city_mileage, engine_type)
VALUES (your-variant-id, '150cc', '15 PS', '45 kmpl', 'Single Cylinder');
```

## Current Fallback Data
The website now shows fallback data when API fails:
- **Upcoming**: KTM RC 390, Triumph Trident 660
- **New Launch**: Hero Splendor Plus with specs

## Quick Test Commands
```bash
# Test database connection
curl "http://localhost:3000/api/test-db"

# Test bike status API
curl "http://localhost:3000/api/bike-status?status=upcoming"
curl "http://localhost:3000/api/bike-status?status=new_launch"
```

## Common Issues

### 1. Missing Foreign Key Data
If you see "Unknown Brand/Model" in API response:
- Check if brand_id in status table matches brands.brand_id
- Check if model_id in status table matches models.model_id
- Check if variant_id in status table matches variants.variant_id

### 2. RLS Blocking Access
Error: "insufficient privileges" or empty results
- Run the disable RLS SQL commands
- Or create proper RLS policies

### 3. Environment Variables
Error: "Missing environment variables"
- Ensure SUPABASE_SERVICE_ROLE_KEY is set
- Restart development server after changing .env.local

### 4. JSON Structure Issues  
Error: "Property does not exist"
- Check if table columns match expected names
- Verify foreign key relationships exist

## Re-enable Security Later
After testing, re-enable RLS:
```sql
ALTER TABLE public.status ENABLE ROW LEVEL SECURITY;
-- Create appropriate policies for your use case
```