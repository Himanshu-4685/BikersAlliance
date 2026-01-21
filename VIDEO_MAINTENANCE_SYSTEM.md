# Video Maintenance System

This document explains the video maintenance system implemented to handle situations where videos are not available or when the video section is under maintenance.

## Overview

Instead of showing a generic 404 error page when videos are unavailable, the system now redirects users to a dedicated maintenance page that provides a better user experience with helpful information and alternative content suggestions.

## Implementation

### Components Created

1. **MaintenancePage Component** (`/components/MaintenancePage.tsx`)
   - Reusable maintenance page component with customizable title, message, and navigation options
   - Provides consistent styling and layout for maintenance scenarios
   - Includes contact information and alternative navigation options

2. **Video Maintenance Page** (`/app/videos/maintenance/page.tsx`)
   - Specialized maintenance page for video-related content
   - Enhanced layout with "Coming Soon" features
   - Alternative content suggestions (News, Browse Bikes)
   - Professional appearance with proper metadata

3. **Global Not Found Page** (`/app/not-found.tsx`)
   - Global 404 handler using the MaintenancePage component
   - Provides consistent experience for any missing pages

### Routing Updates

1. **Video Slug Page** (`/app/videos/[slug]/page.tsx`)
   - Changed from `notFound()` to `redirect('/videos/maintenance')`
   - Handles individual video pages that don't exist

2. **Main Videos Page** (`/app/videos/page.tsx`)
   - Redirects to maintenance if no videos are available in database
   - Checks video availability before rendering content

3. **Video Category Pages** (`/app/videos/category/[category]/page.tsx`)
   - Redirects to maintenance for invalid categories
   - Redirects to maintenance if no videos exist in the category

### Component Updates

1. **RelatedVideos Component** (`/components/videos/RelatedVideos.tsx`)
   - Shows maintenance message when no related videos available
   - Provides alternative navigation to news section

### Middleware Enhancement

1. **Updated Middleware** (`/middleware.ts`)
   - Added video route handling alongside existing authentication logic
   - Checks database for video availability at middleware level
   - Redirects to maintenance page if no videos found
   - Handles video routes: `/videos/:path*` (excluding maintenance and API routes)

### Utility Functions

1. **Video Utils** (`/utils/video-utils.ts`)
   - `checkVideoAvailability()`: Server-side function to check if videos exist
   - `getVideosCount()`: Returns count of published videos
   - Handles database errors gracefully

2. **Video Status Hook** (`/hooks/useVideoStatus.ts`)
   - `useVideoStatus()`: Client-side hook for checking video availability
   - `useVideoRedirect()`: Hook that automatically redirects if videos unavailable
   - Useful for dynamic client-side components

## User Experience Flow

### When Videos Are Available
1. User navigates to `/videos` → Shows normal video listing
2. User navigates to `/videos/[slug]` → Shows individual video page
3. User navigates to `/videos/category/[category]` → Shows category videos

### When Videos Are Unavailable
1. User navigates to `/videos` → Redirects to `/videos/maintenance`
2. User navigates to `/videos/[slug]` → Redirects to `/videos/maintenance`
3. User navigates to `/videos/category/[category]` → Redirects to `/videos/maintenance`
4. User sees professional maintenance page with:
   - Clear explanation of the situation
   - Coming soon features list
   - Alternative content suggestions (News, Browse Bikes)
   - Navigation back to homepage or contact support

## Technical Features

### Server-Side Checks
- Database queries are performed at the page level before rendering
- Middleware performs additional checks for efficiency
- Proper error handling with fallbacks

### SEO Optimization
- Maintenance pages have proper metadata
- 503 status codes could be added for better SEO (future enhancement)
- Structured content with clear messaging

### Performance Considerations
- Database queries are minimal and efficient
- Caching can be added for video availability status (future enhancement)
- Middleware checks are lightweight

## Configuration

### Environment Variables
The system uses existing Supabase configuration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Requirements
- Videos table with `is_published` boolean field
- Standard Supabase setup

## Future Enhancements

1. **Admin Controls**
   - Toggle maintenance mode from admin panel
   - Custom maintenance messages
   - Scheduled maintenance notifications

2. **Caching**
   - Redis or in-memory cache for video availability status
   - Reduce database queries for better performance

3. **Analytics**
   - Track maintenance page visits
   - Monitor redirect patterns

4. **Status Codes**
   - Return proper 503 status codes for maintenance pages
   - Better SEO handling for temporary unavailability

## Testing

To test the maintenance system:

1. **Enable Maintenance Mode**:
   - Remove all videos from the database, or
   - Set all videos' `is_published` to `false`

2. **Test Routes**:
   - Visit `/videos` → Should redirect to `/videos/maintenance`
   - Visit `/videos/any-slug` → Should redirect to `/videos/maintenance`
   - Visit `/videos/category/reviews` → Should redirect to `/videos/maintenance`

3. **Disable Maintenance Mode**:
   - Add videos back to database with `is_published = true`
   - Routes should work normally

## Troubleshooting

### Common Issues

1. **Infinite Redirects**
   - Ensure `/videos/maintenance` route is excluded from middleware checks
   - Check that maintenance page doesn't try to access video data

2. **Database Connection Issues**
   - Maintenance system gracefully handles database errors
   - Falls back to maintenance mode on connection failures

3. **Caching Issues**
   - Video availability checks are performed on each request
   - Consider implementing cache invalidation for production

## Files Modified/Created

### New Files
- `/components/MaintenancePage.tsx`
- `/app/videos/maintenance/page.tsx`
- `/app/not-found.tsx`
- `/utils/video-utils.ts`
- `/hooks/useVideoStatus.ts`

### Modified Files
- `/app/videos/[slug]/page.tsx`
- `/app/videos/page.tsx`
- `/app/videos/category/[category]/page.tsx`
- `/components/videos/RelatedVideos.tsx`
- `/middleware.ts`

This system provides a professional and user-friendly way to handle video unavailability while maintaining good SEO practices and user experience standards.