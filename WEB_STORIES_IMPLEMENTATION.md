# Web Stories Implementation

## Overview
The web stories feature has been updated to use real database data instead of static content. This document outlines the changes made and how to use the system.

## Changes Made

### 1. Database Structure
- Added missing columns to `web_stories` table:
  - `description` (TEXT) - Story description
  - `category` (TEXT) - Story category (default: 'General')
  - `featured` (BOOLEAN) - Whether the story is featured (default: false)

### 2. Sample Data
Created 5 real web stories using the images in `/public/images/web-stories/`:
- **Best Sports Bikes in India** - Featured, Buying Guide category
- **Top Adventure Bikes Under 3 Lakhs** - Featured, Buying Guide category  
- **Upcoming Bikes 2024** - General category
- **Best Mileage Bikes Under 2 Lakhs** - Buying Guide category
- **Best Upcoming Electric Bikes** - Featured, Performance category

### 3. Homepage Component Updates
Updated `components/home/WebStories.tsx`:
- Now fetches real data from `/api/web-stories` endpoint
- Added loading states and error handling
- Uses actual story slugs and cover images
- Displays proper publication dates

### 4. Web Story Viewer Updates
Updated `components/web-stories/WebStoryViewer.tsx`:
- Updated interface to match database structure
- Uses `image_url` and `caption` from pages array
- Displays category and publication date
- Improved content layout

### 5. Slug Page Updates
Updated `app/web-stories/[slug]/page.tsx`:
- Properly normalizes database data for component
- Uses correct field names from database

## Web Stories Structure

Each web story contains:
```typescript
{
  id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image_url: string;
  author: string;
  category: string;
  featured: boolean;
  is_published: boolean;
  pages: Array<{
    image_url: string;
    caption?: string;
  }>;
  published_at: string;
  created_at: string;
  updated_at: string;
}
```

## Available Categories
- General
- Buying Guide
- Tips
- Comparison
- Safety
- Performance
- Maintenance

## API Endpoints

### GET /api/web-stories
Query parameters:
- `limit` - Number of stories to fetch (default: 20)
- `featured` - Filter by featured stories (true/false)
- `category` - Filter by category name

## Images Used
- `/images/web-stories/1.avif` - Sports bikes cover
- `/images/web-stories/2.avif` - Adventure bikes cover  
- `/images/web-stories/3.avif` - Upcoming bikes cover
- `/images/web-stories/4.avif` - Mileage bikes cover
- `/images/web-stories/5.avif` - Electric bikes cover
- `/images/web-stories/6.avif` - Additional story pages
- `/images/web-stories/7.avif` - Additional story pages

## Testing
1. Visit homepage - Web stories should load dynamically
2. Click on any web story - Should navigate to proper story page
3. Visit `/web-stories` - Should show all stories with filtering
4. Admin panel at `/admin/web-stories` - Can manage stories

## Scripts Used
- `add-sample-webstories.js` - Adds sample web story data
- `fix-webstories-schema.js` - Adds missing database columns
- `test-webstories-api.js` - Tests the API endpoints

All web stories are now functional and clickable with real content!