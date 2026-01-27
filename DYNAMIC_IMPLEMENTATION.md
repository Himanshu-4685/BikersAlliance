# Dynamic Showrooms & Charging Stations Implementation

## Overview
This implementation converts the static showrooms and charging stations data to dynamic pages that fetch data from Supabase tables.

## Database Schema

### Tables Created:
1. **`showrooms`** - Stores showroom/dealer information
2. **`charging_stations`** - Stores electric charging station information

### Files Modified:
- `/app/api/showrooms/route.ts` - Updated to use Supabase
- `/app/api/charging-stations/route.ts` - New API endpoint created
- `/app/electric/charging-stations/page.tsx` - Updated to use dynamic data

## Setup Instructions

### 1. Database Setup
Run these SQL files in your Supabase SQL Editor:

```sql
-- 1. Create tables and indexes
\i sql-schemas/showrooms-schema.sql

-- 2. Insert sample data
\i sql-schemas/showrooms-data.sql
\i sql-schemas/charging-stations-data.sql
```

### 2. Storage Setup
In Supabase Dashboard:

1. Go to **Storage** → **Bikeralliance** bucket
2. Create folder structure:
   ```
   /Image/
     /Showrooms/
     /Charging-Stations/
   ```

3. Upload images to respective folders (use .avif format for optimization)
4. Images will be accessible via:
   ```
   https://csvzysxiuuzcsmpknehi.supabase.co/storage/v1/object/public/Bikeralliance/Image/Showrooms/{filename}
   ```

5. Run storage policies:
   ```sql
   \i sql-schemas/storage-setup.sql
   ```

### 3. Environment Variables
Ensure your `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Dependencies
Ensure these packages are installed:
```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

## Features Implemented

### Showrooms (Dynamic)
- ✅ Supabase integration
- ✅ Search functionality  
- ✅ City/brand filtering
- ✅ Featured/verified filters
- ✅ Pagination
- ✅ Individual showroom pages (`/showrooms/[slug]`)
- ✅ RLS policies

### Charging Stations (Dynamic)  
- ✅ Supabase integration
- ✅ Search functionality
- ✅ State/city filtering  
- ✅ Status filtering (Available/Occupied/Maintenance)
- ✅ Pagination
- ✅ Real-time status display
- ✅ RLS policies

## API Endpoints

### Showrooms
- `GET /api/showrooms` - List showrooms with filters
  - Query params: `city`, `brand`, `featured`, `verified`, `search`, `page`, `limit`

### Charging Stations  
- `GET /api/charging-stations` - List charging stations with filters
  - Query params: `city`, `state`, `status`, `search`, `page`, `limit`
- `POST /api/charging-stations` - Get single station by slug

## Database Schema Details

### Showrooms Table
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- slug (VARCHAR, Unique)  
- brand_* (Brand information)
- address_* (Address fields)
- contact_* (Contact information)
- timings_* (Business hours)
- services (JSONB array)
- rating (DECIMAL)
- reviews (INTEGER)
- verified (BOOLEAN)
- featured (BOOLEAN)
- coordinates (lat/lng)
- description (TEXT)
- established (VARCHAR)
- area_served (JSONB array)
```

### Charging Stations Table
```sql
- id (UUID, Primary Key)
- name (VARCHAR)
- slug (VARCHAR, Unique)
- location (VARCHAR) 
- address (TEXT)
- city/state (VARCHAR)
- contact info (phone, email)
- timing (VARCHAR)
- connector_types (JSONB array)
- charging_speed (VARCHAR)
- status (ENUM)
- pricing (VARCHAR)
- amenities (JSONB array)  
- coordinates (lat/lng)
- operator info
```

## Performance Optimizations
- Database indexes on frequently queried columns
- Pagination to limit data transfer
- RLS policies for security
- Optimized API responses with data transformation

## Next Steps
1. Upload showroom images to Supabase storage
2. Create admin interface for managing data
3. Add real-time status updates for charging stations
4. Implement user reviews and ratings
5. Add map integration for location visualization

## Security
- Row Level Security (RLS) enabled
- Public read access for all users
- Authenticated-only write access
- Input validation and sanitization