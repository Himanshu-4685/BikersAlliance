# Dynamic Bike Status System Documentation

## Overview
This system replaces the hardcoded "Upcoming Bikes & Scooters" section with a dynamic database-driven solution. It allows you to manage bike launch statuses through a database table and display different information based on whether bikes are "upcoming" or "new_launch".

## Database Schema

### Status Table
```sql
CREATE TABLE public.status (
  status_id integer NOT NULL DEFAULT nextval('status_status_id_seq'::regclass),
  brand_id uuid NOT NULL,
  model_id integer NOT NULL,
  variant_id integer NOT NULL,
  status text NOT NULL CHECK (status IN ('upcoming', 'new_launch')),
  price_range text, -- e.g., "2.77 - 3.20 Lakh"
  expected_launch date, -- Expected launch date for upcoming bikes
  launch_date date, -- Actual launch date for new_launch bikes
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT status_pkey PRIMARY KEY (status_id),
  CONSTRAINT status_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(brand_id),
  CONSTRAINT status_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.models(model_id),
  CONSTRAINT status_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.variants(variant_id),
  CONSTRAINT status_variant_unique UNIQUE (variant_id)
);
```

### Relationships
- `brand_id` → `brands.brand_id`
- `model_id` → `models.model_id`
- `variant_id` → `variants.variant_id`
- `variant_id` → `images.variant_id` (for bike images)
- `variant_id` → `specs.variant_id` (for technical specifications)

## How It Works

### Status Types
1. **upcoming**: Shows expected price range and launch date
2. **new_launch**: Shows specifications from the specs table

### Display Logic
- **Upcoming Bikes**: Display price range, expected launch date, and "Get Notified" button
- **New Launch Bikes**: Display specifications (engine, mileage, power) and "View Details" button

### Data Flow
1. Admin adds bike variants to the `status` table with appropriate status
2. API endpoints fetch data with joins to related tables
3. Frontend components render cards based on status type
4. Images come from `images` table linked to `variant_id`
5. Specs come from `specs` table linked to `variant_id`

## API Endpoints

### GET /api/bike-status
Fetch bike status with optional filtering
```
Query Parameters:
- status: 'upcoming' | 'new_launch' (optional)
- limit: number (default: 10)
```

### POST /api/bike-status
Create new bike status
```json
{
  "brand_id": "uuid",
  "model_id": 123,
  "variant_id": 456,
  "status": "upcoming",
  "price_range": "2.77 - 3.20 Lakh",
  "expected_launch": "2024-03-15"
}
```

### PUT /api/bike-status/[id]
Update existing bike status

### DELETE /api/bike-status/[id]
Delete bike status

## Components

### DynamicBikeStatus Component
Located: `components/home/DynamicBikeStatus.tsx`

Props:
- `status`: 'upcoming' | 'new_launch'
- `title`: Section title
- `viewAllLink`: Link for "View All" button
- `limit`: Number of bikes to display (default: 8)

Usage:
```tsx
<DynamicBikeStatus 
  status="upcoming"
  title="Upcoming Bikes & Scooters"
  viewAllLink="/upcoming-bikes"
  limit={8}
/>
```

### BikeStatusManager Component (Admin)
Located: `components/admin/BikeStatusManager.tsx`

Features:
- Add new bike status
- Edit existing status
- Delete status
- List all bike statuses

## Setup Instructions

### 1. Database Setup
1. Run the SQL schema from `sql-schemas/status-table-schema.sql`
2. Optionally insert sample data from `sql-schemas/status-sample-data.sql`

### 2. Environment Variables
Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Update Homepage
The homepage (`app/page.tsx`) has been updated to use `DynamicBikeStatus` components:
- Upcoming section: Shows upcoming bikes
- Latest section: Shows new launch bikes

### 4. Admin Interface
Include the `BikeStatusManager` component in your admin dashboard to manage bike statuses.

## Migration from Hardcoded Data

### Before (Hardcoded)
- Static array in `components/home/UpcomingBikes.tsx`
- Manual updates required for new bikes
- No dynamic content management

### After (Dynamic)
- Database-driven content
- Admin interface for management
- Automatic image and spec integration
- Real-time updates without code changes

## Usage Examples

### Adding a New Upcoming Bike
```sql
INSERT INTO status (brand_id, model_id, variant_id, status, price_range, expected_launch)
VALUES ('brand-uuid', 123, 456, 'upcoming', '2.50 - 3.00 Lakh', '2024-06-15');
```

### Updating Status from Upcoming to Launched
```sql
UPDATE status 
SET status = 'new_launch', 
    launch_date = '2024-06-15', 
    expected_launch = NULL
WHERE variant_id = 456;
```

### Required Data Dependencies
Before adding to status table, ensure:
1. Brand exists in `brands` table
2. Model exists in `models` table  
3. Variant exists in `variants` table
4. Images exist in `images` table (optional but recommended)
5. Specs exist in `specs` table (required for new_launch status)

## Benefits

1. **Dynamic Content**: No code deployment needed for updates
2. **Admin Control**: Easy management through admin interface
3. **Data Integrity**: Foreign key constraints ensure valid relationships
4. **Flexible Display**: Different rendering based on status
5. **Scalable**: Easy to add new status types or fields
6. **SEO Friendly**: Dynamic meta data and structured content

## Future Enhancements

1. **Notification System**: Integrate with email/SMS for launch notifications
2. **Analytics**: Track interest in upcoming bikes
3. **Filtering**: Advanced filtering by brand, price range, launch date
4. **Wishlist**: Allow users to save upcoming bikes
5. **Social Sharing**: Share upcoming bikes on social media
6. **Comparison**: Compare upcoming vs launched bikes