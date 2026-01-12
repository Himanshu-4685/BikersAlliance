#!/usr/bin/env node

/**
 * Debug script for bookings API issue
 */

function debugBookingsAPI() {
  console.log('🔍 Debugging Bookings API Issue\n');

  console.log('📊 Current Situation:');
  console.log('✅ Database shows 2 bookings exist (booking_id: 1, 2)');
  console.log('✅ User ID: c2079b46-9d72-4eb2-ad4b-c3416b6fdd55');
  console.log('❌ Frontend shows "0 bookings found"');
  console.log();

  console.log('🔧 Changes Made:');
  console.log('1. ✅ Fixed API response access: result.bookings → result.data.bookings');
  console.log('2. ✅ Added authentication to bookings GET API');
  console.log('3. ✅ Added debug logging to API and component');
  console.log();

  console.log('🔍 Possible Issues:');
  console.log('1. User ID mismatch between authenticated user and bookings');
  console.log('2. Database user_id column type (should be UUID after our fix)');
  console.log('3. API authentication or query filtering');
  console.log();

  console.log('🎯 Next Steps to Debug:');
  console.log('1. Refresh the "My Bookings" page');
  console.log('2. Check browser console for debug logs:');
  console.log('   - "Bookings API Response:" (from component)');
  console.log('   - "Bookings GET API - Query params:" (from API)');
  console.log('   - "Bookings query result:" (from API)');
  console.log();

  console.log('💡 Expected Debug Output:');
  console.log('Component should log: { status: 200, result: { success: true, data: { bookings: [...] } } }');
  console.log('API should log: { bookingsCount: 2, error: undefined, userId: "c207..." }');
  console.log();

  console.log('🚨 If Still No Bookings:');
  console.log('The issue might be:');
  console.log('- Bookings table user_id column still has wrong data type');
  console.log('- User authentication mismatch');
  console.log('- Need to run the database migration first');
  console.log();

  console.log('🔧 Quick Database Check:');
  console.log('Run this SQL to verify bookings data:');
  console.log('SELECT booking_id, user_id, variant_id, status, price, created_at FROM public.bookings;');
  console.log();

  console.log('🚀 Try refreshing the My Bookings page and check the console logs!');
}

// Run the debug
debugBookingsAPI();