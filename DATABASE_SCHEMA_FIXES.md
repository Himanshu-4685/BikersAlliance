# Database Schema Fixes for User Bike Submissions

## Issues Identified
1. **Foreign Key Mismatch**: The original schema referenced `public.users(id)` but the actual primary key is `public.users(user_id)`
2. **Data Type Mismatch**: The original schema used `uuid` for `user_id` but the actual `users.user_id` is an `integer`
3. **RLS Policy Mismatch**: The policies used `auth.uid()` which returns UUID, but needed to match with integer `user_id`

## Fixes Applied

### 1. Fixed Foreign Key Reference
**Changed from:**
```sql
user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
```
**To:**
```sql
user_id integer NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
```

### 2. Updated RLS Policies
**Changed from:**
```sql
CREATE POLICY "Users can view own submissions" ON public.user_bike_submissions
  FOR SELECT USING (auth.uid() = user_id);
```
**To:**
```sql
CREATE POLICY "Users can view own submissions" ON public.user_bike_submissions
  FOR SELECT USING (
    user_id IN (
      SELECT u.user_id FROM public.users u WHERE u.email = auth.email()
    )
  );
```

This pattern matches the existing approach used in the wishlist API where the system:
1. Gets the authenticated user's email from `auth.email()`
2. Looks up the corresponding integer `user_id` from the `users` table
3. Uses that `user_id` for RLS policies

### 3. Updated API Endpoints

#### Sell Bike API (`/api/sell-bike`)
- Added user lookup by email before creating submission tracking
- Uses `userRecord.user_id` (integer) instead of `user.id` (UUID)
- Graceful handling if user lookup fails (bike still gets created)

#### User Bike Submissions API (`/api/user-bike-submissions`)
- Both GET and PATCH methods updated to lookup user by email first
- Uses integer `user_id` for all database operations
- Consistent error handling for user not found scenarios

## Database Schema Commands

Run this SQL in your Supabase database:

```sql
-- The corrected user_bike_submissions table creation
-- (This is the corrected version from user-bike-submissions-schema.sql)
```

## Testing Steps

1. **Deploy the SQL schema** to your Supabase database
2. **Test authentication flow**: 
   - Login as a user
   - Access `/sell-bike` (should work)
   - Submit a bike listing
3. **Test activity tracking**:
   - Visit `/dashboard/activity`
   - Should show the submitted bike with status
4. **Test user permissions**:
   - Login as different users
   - Each should only see their own submissions

## Key Changes Summary

- **Schema**: Fixed column references and data types
- **RLS Policies**: Use email-based lookup instead of direct UUID comparison
- **APIs**: Consistent user lookup pattern across all endpoints
- **Error Handling**: Graceful degradation when user lookup fails

The fixes ensure compatibility with the existing database structure while maintaining security and proper user isolation.