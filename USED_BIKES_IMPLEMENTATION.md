# Used Bikes (Sell Bike) Implementation

This document outlines the implementation of the used bikes functionality for BikersAlliance.

## Overview

The used bikes system allows users to:
1. Submit their bikes for sale through a multi-step form
2. Upload photos to Supabase storage
3. Browse and filter available used bikes
4. Admin can manage and moderate listings

## Database Schema

### Table: `used_bikes`

```sql
CREATE TABLE public.used_bikes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Bike Details
  brand varchar NOT NULL,
  model varchar NOT NULL,
  variant varchar,
  year integer NOT NULL,
  category varchar NOT NULL,
  fuel_type varchar NOT NULL,
  transmission varchar NOT NULL,
  km_driven integer NOT NULL,
  ownership varchar NOT NULL,
  
  -- Pricing and Condition
  expected_price integer NOT NULL,
  condition varchar NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair')),
  description text,
  
  -- Contact Details
  owner_name varchar NOT NULL,
  email varchar NOT NULL,
  phone varchar NOT NULL,
  city varchar NOT NULL,
  state varchar NOT NULL,
  
  -- Documents
  has_rc boolean DEFAULT false,
  has_insurance boolean DEFAULT false,
  has_puc boolean DEFAULT false,
  
  -- Photos
  photos jsonb DEFAULT '[]'::jsonb,
  
  -- Status and admin fields
  status varchar DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold')),
  admin_notes text,
  verified boolean DEFAULT false,
  featured boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  sold_at timestamptz
);
```

### Storage Bucket: `sell-bikes`

Used for storing bike photos with public read access.

## API Endpoints

### Public Endpoints

1. **POST /api/sell-bike** - Submit a new bike listing
2. **GET /api/sell-bike** - Fetch approved bike listings with filtering
3. **POST /api/upload/sell-bike-images** - Upload bike photos
4. **DELETE /api/upload/sell-bike-images** - Delete bike photos

### Admin Endpoints

1. **GET /api/admin/used-bikes** - Fetch all listings for admin
2. **PUT /api/admin/used-bikes** - Update listing status/details
3. **DELETE /api/admin/used-bikes** - Delete a listing

## Pages

### 1. Sell Bike Form (`/sell-bike`)
- 4-step multi-step form
- Real-time photo upload with preview
- Form validation and error handling
- Success/error feedback

### 2. Used Bikes Listing (`/used-bikes`)
- Filter by category, fuel type, price, location
- Pagination
- Detailed bike modals
- Contact seller functionality

### 3. Admin Panel (`/admin/used-bikes`)
- View all submissions
- Approve/reject listings
- Add admin notes
- Toggle featured status
- Delete listings
- Statistics dashboard

## Features Implemented

### User Features
- ✅ Multi-step form submission
- ✅ Photo upload with preview and removal
- ✅ Form validation (email, phone, price, year)
- ✅ Success/error feedback
- ✅ Browse approved listings
- ✅ Advanced filtering and search
- ✅ Detailed bike view modals
- ✅ Pagination

### Admin Features
- ✅ Complete admin dashboard
- ✅ Approve/reject listings
- ✅ View full bike details including contact info
- ✅ Add admin notes
- ✅ Toggle featured status
- ✅ Delete listings
- ✅ Statistics (pending, approved, sold counts)
- ✅ Search and filter functionality

### Technical Features
- ✅ Supabase integration
- ✅ File upload to Supabase storage
- ✅ RLS (Row Level Security) policies
- ✅ TypeScript interfaces
- ✅ Responsive design
- ✅ Loading states and error handling
- ✅ Image optimization with Next.js Image component

## Security

1. **RLS Policies**: 
   - Anyone can insert (submit listings)
   - Only approved listings are public
   - Admins have full access

2. **File Upload**: 
   - File size validation (5MB max)
   - File type validation (images only)
   - Unique file naming to prevent conflicts

3. **Form Validation**:
   - Server-side validation for all fields
   - Email format validation
   - Phone number format validation (Indian numbers)
   - Price and year range validation

## Usage

### For Users
1. Visit `/sell-bike` to list a bike
2. Fill out the 4-step form with bike details, condition, contact info, and photos
3. Submit and wait for admin approval
4. Browse available bikes at `/used-bikes`

### For Admins
1. Access `/admin/used-bikes` to manage listings
2. Review submissions and approve/reject
3. Add notes for communication
4. Mark bikes as featured for better visibility
5. Update status to 'sold' when bikes are sold

## Installation & Setup

1. Run the SQL schema file to create the database table:
   ```bash
   psql -f sql-schemas/used-bikes-schema.sql
   ```

2. Ensure Supabase storage bucket 'sell-bikes' exists and has proper policies

3. The admin navigation already includes the "Used Bikes" menu item

4. Test the functionality:
   - Submit a test listing via `/sell-bike`
   - Check admin panel at `/admin/used-bikes`
   - Approve the listing and verify it appears on `/used-bikes`

## Future Enhancements

1. Email notifications to users when status changes
2. SMS notifications for contact inquiries
3. Integration with payment gateway for premium listings
4. Auto-expire old listings
5. Bike comparison feature
6. Wishlist functionality for users
7. Advanced search with model-specific filters
8. Geo-location based search
9. Chat system between buyer and seller
10. Mobile app integration