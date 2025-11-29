# User Registration Issue - Users Not Appearing in Database

## Problem
When users register through the signup form, they are successfully created in Supabase Auth (`auth.users` table) but do not appear in the public `users` table that the application uses for user profiles and relationships.

## Root Cause
The application has a mismatch between:
1. **Supabase Auth**: Uses UUID as primary keys in `auth.users`
2. **Application Database**: Uses integer `user_id` in `public.users` table
3. **Missing Trigger**: No database trigger to automatically create user profiles when someone signs up

## Current Behavior
✅ User registration works (user created in `auth.users`)  
✅ User can login successfully  
❌ User profile not created in `public.users`  
❌ User won't appear in admin panel or user lists  
❌ Cannot create bookings, favorites, reviews, etc.  

## Solutions

### Option 1: Quick Fix (Recommended for immediate testing)
Run the simple trigger script to automatically create users in the existing table structure:

```sql
-- File: sql-schemas/simple-user-trigger.sql
-- This creates a trigger that inserts into the existing users table
```

**Steps:**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of `sql-schemas/simple-user-trigger.sql`
4. Run the script
5. Test registration again

### Option 2: Complete Database Restructure (Recommended for production)
Update the database schema to properly align with Supabase Auth:

```sql
-- File: sql-schemas/fix-users-table.sql
-- This creates a new users table with UUID primary keys matching auth.users
```

**Steps:**
1. Backup your current database
2. Run the script in `sql-schemas/fix-users-table.sql`
3. Update any existing application code that references the old integer user_id
4. Test all functionality

### Option 3: Manual User Creation (For immediate debugging)
1. Visit: `http://localhost:3000/debug-users`
2. Register a new account
3. Use the debug tool to manually create the user profile
4. This helps verify the issue and test the fix

## Debug Tools

### Check Current State
```sql
-- File: sql-schemas/check-user-setup.sql
-- Run this to see current users in both auth.users and public.users
```

### Web Debug Tool
Visit `/debug-users` page to:
- See current authenticated user info
- Check both user tables
- Manually create missing user profiles
- Verify the registration flow

## Implementation Details

### Database Trigger Function
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (full_name, email, created_at)
  VALUES (
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Trigger Creation
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Verification Steps

After implementing the fix:

1. **Register a new user**
   ```
   Navigate to /register
   Fill in: Full Name, Email, Password
   Submit form
   ```

2. **Check auth.users** (in Supabase dashboard)
   ```sql
   SELECT id, email, raw_user_meta_data->>'full_name' as full_name, created_at 
   FROM auth.users 
   ORDER BY created_at DESC;
   ```

3. **Check public.users**
   ```sql
   SELECT * FROM public.users ORDER BY created_at DESC;
   ```

4. **Test login**
   - User should be able to login
   - Dashboard should work
   - User profile should display correctly

## Future Considerations

1. **Email Confirmation**: If Supabase email confirmation is enabled, users need to confirm their email before the trigger runs
2. **Error Handling**: The trigger includes error handling to prevent auth failures if profile creation fails
3. **Data Migration**: If you have existing users, you may need to migrate data between the old and new table structures
4. **Application Updates**: Some parts of the application may need updates to work with the new user table structure

## Files Modified/Created

- `sql-schemas/fix-users-table.sql` - Complete database restructure
- `sql-schemas/simple-user-trigger.sql` - Quick fix trigger
- `sql-schemas/check-user-setup.sql` - Debug queries
- `components/debug/UserDebugTool.tsx` - Web debug tool
- `app/debug-users/page.tsx` - Debug page
- `app/register/page.tsx` - Fixed error handling

## Test Results Expected

✅ New registrations create user in both `auth.users` and `public.users`  
✅ User can login and access dashboard  
✅ User appears in admin panel user management  
✅ User can create bookings, favorites, reviews  
✅ All user-related functionality works properly  