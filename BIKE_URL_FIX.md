# Bike Detail Page URL Fix

## Issue
Bike detail pages were not accessible from home page spotlight sections and other areas, showing 404 errors, even though they worked when accessed through the brands page.

## Root Cause
There was a mismatch between:
1. Frontend components using `variant_url` field from database (inconsistent/empty slugs)
2. API route `/api/models/[slug]` expecting slugs generated from variant names

## Solution
1. **Created consistent slug utility** (`lib/slug-utils.ts`):
   - `generateBikeSlug()` - generates URL-friendly slugs from variant names
   - `cleanBikeName()` - cleans bike names by removing duplicate brand/model references
   - Matches the slug generation logic used in `/api/models/[slug]` 

2. **Updated frontend components** to use consistent slug generation:
   - `components/home/FeaturedBikes.tsx`
   - `components/home/PopularScooters.tsx`
   - `components/home/ElectricBikes.tsx`

3. **Updated API endpoints** to generate consistent slugs:
   - `/api/bikes/category/route.ts`
   - `/api/bikes/scooters/route.ts`
   - `/api/bikes/electric/route.ts`
   - `/api/brands/[slug]/route.ts`

## Changes Made
- ✅ All components now generate slugs using: `generateBikeSlug(cleanBikeName(modelName, variantName, brandName))`
- ✅ This matches exactly what `/api/models/[slug]` expects
- ✅ No more dependency on potentially empty/inconsistent database `url` field
- ✅ Consistent slug format across all parts of the application

## Result
- Bike detail pages now work from all sections (Bikes in Spotlight, Scooters in Spotlight, etc.)
- URLs are consistent and SEO-friendly
- No more 404 errors when clicking on bike cards from the home page

## Test
Navigate to home page and click on any bike card in the spotlight sections - they should now properly navigate to the bike detail pages.