# Bike Details Page Enhancement - User Orders & Leads System

This implementation adds two major features to the bike details page:

## Features Implemented

### 1. "Add to Orders" Button
- **Location**: Above "Get On Road Price" button in the pricing section
- **Authentication**: Requires user login - redirects to login page if not authenticated
- **Functionality**: Adds selected bike variant to user's orders
- **Database**: Stores order data in `user_orders` table
- **Dashboard**: Shows user orders in the dashboard page

### 2. Lead Generation Forms
- **Triggers**: "Get On Road Price" and "Book Test Ride" buttons now open popup forms
- **Form Fields**: 
  - Name (required)
  - Phone Number (required, 10 digits)
  - Email (required, valid email format)
  - Address (required, textarea)
  - Pincode (required, 6 digits)
- **Database**: Stores lead data in `leads` table
- **Validation**: Client-side and server-side validation

## Database Schema

### user_orders Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- variant_id (INTEGER)
- bike_name (TEXT)
- variant_name (TEXT)
- price (DECIMAL)
- brand_name (TEXT)
- image_url (TEXT, nullable)
- status (ENUM: pending, confirmed, cancelled)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### leads Table
```sql
- id (UUID, Primary Key)
- name (TEXT)
- phone (TEXT)
- email (TEXT)
- address (TEXT)
- pincode (TEXT)
- variant_id (INTEGER)
- bike_name (TEXT)
- variant_name (TEXT)
- brand_name (TEXT)
- lead_type (ENUM: get_on_road_price, book_test_ride)
- status (ENUM: new, contacted, qualified, closed)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Files Created/Modified

### New Files Created:
1. `sql-schemas/user-orders-leads.sql` - Database schema for new tables
2. `components/bikes/LeadFormPopup.tsx` - Popup form component
3. `app/api/user-orders/route.ts` - API for order management
4. `app/api/leads/route.ts` - API for lead management

### Modified Files:
1. `app/bikes/[slug]/page.tsx` - Updated bike details page
2. `app/dashboard/page.tsx` - Enhanced dashboard to show orders
3. `lib/supabase-client.ts` - Added TypeScript types for new tables

## Installation Steps

### 1. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `sql-schemas/user-orders-leads.sql`
4. Click "RUN" to execute the script

### 2. Authentication Setup
The implementation uses the existing authentication system:
- Supabase Auth for user management
- Row Level Security (RLS) policies for data protection
- Authentication context for user state management

### 3. Features Testing

#### Test Add to Orders:
1. Visit any bike details page (e.g., `/bikes/hero-splendor-plus`)
2. Click "Add to Orders" button
3. If not logged in, you'll be redirected to login
4. After login, the bike will be added to your orders
5. Visit dashboard to see your orders

#### Test Lead Forms:
1. Visit any bike details page
2. Click "Get On Road Price" or "Book Test Ride"
3. Fill out the popup form with required information
4. Submit the form
5. Data will be stored in the leads table

## Security Features

### Authentication & Authorization:
- **Add to Orders**: Requires user authentication
- **Lead Forms**: No authentication required (public leads)
- **API Protection**: Orders API requires valid auth token
- **RLS Policies**: Row-level security ensures users only see their own orders

### Data Validation:
- **Client-side**: Form validation in popup component
- **Server-side**: API validation for all inputs
- **Type Safety**: TypeScript interfaces for all data structures

## UI/UX Enhancements

### Bike Details Page:
- New green "Add to Orders" button with shopping cart icon
- Existing buttons now open popup forms instead of being static
- Loading states and error handling for all interactions

### Dashboard:
- Real-time order display with bike images
- Order status indicators (pending, confirmed, cancelled)
- Empty state with call-to-action to browse bikes
- Responsive design for mobile and desktop

### Popup Form:
- Clean, modal design with backdrop
- Form validation with error states
- Success confirmation with auto-close
- Responsive layout
- Icon-enhanced input fields

## API Endpoints

### POST `/api/user-orders`
- **Purpose**: Add new order
- **Authentication**: Required
- **Payload**: `{ variant_id, bike_name, variant_name, price, brand_name, image_url }`

### GET `/api/user-orders`
- **Purpose**: Get user orders
- **Authentication**: Required
- **Response**: Array of user orders

### POST `/api/leads`
- **Purpose**: Submit lead form
- **Authentication**: Not required
- **Payload**: `{ name, phone, email, address, pincode, variant_id, bike_name, variant_name, brand_name, lead_type }`

### GET `/api/leads`
- **Purpose**: Get leads (admin feature)
- **Query params**: `lead_type`, `status`, `page`, `limit`

## Future Enhancements

1. **Admin Panel**: Manage orders and leads from admin dashboard
2. **Email Notifications**: Send emails on form submissions
3. **SMS Integration**: Send SMS confirmations for test rides
4. **Order Status Updates**: Allow users to track order progress
5. **Dealer Integration**: Connect leads to nearby dealers
6. **Payment Integration**: Add payment processing for orders
7. **Inventory Management**: Check bike availability before orders

## Troubleshooting

### Common Issues:
1. **Database Error**: Make sure SQL script is executed in Supabase
2. **Authentication Issues**: Verify Supabase environment variables
3. **Type Errors**: Ensure TypeScript types are properly imported
4. **RLS Issues**: Check if RLS policies are correctly applied

### Debug Steps:
1. Check browser console for JavaScript errors
2. Verify API responses in Network tab
3. Check Supabase logs for database errors
4. Test authentication flow independently

## Development Notes

- All APIs include proper error handling and validation
- TypeScript interfaces ensure type safety
- Responsive design works on all screen sizes
- Loading states provide good user feedback
- Form validation prevents invalid data submission