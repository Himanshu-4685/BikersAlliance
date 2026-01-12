#!/usr/bin/env node

/**
 * Debug script for dealers table column names
 */

function debugDealersTable() {
  console.log('🔍 Debugging Dealers Table Column Issue\n');

  console.log('❌ Previous Error:');
  console.log('Error Code: 42703 (column does not exist)');
  console.log('Issue: Trying to access dealer_name, contact_phone, contact_email');
  console.log('Expected columns in dealers table based on schema:');
  console.log();

  console.log('✅ Actual Dealers Table Schema:');
  console.log('CREATE TABLE public.dealers (');
  console.log('  dealer_id integer PRIMARY KEY,');
  console.log('  name text NOT NULL,              -- NOT dealer_name');
  console.log('  address text,');
  console.log('  city text,');
  console.log('  state text,');
  console.log('  pincode text,');
  console.log('  phone text,                      -- NOT contact_phone');
  console.log('  email text,                      -- NOT contact_email');
  console.log('  created_at timestamp');
  console.log(');');
  console.log();

  console.log('🔧 API Query Changes Made:');
  console.log('Old Query:');
  console.log('dealers(dealer_name, contact_phone, contact_email)');
  console.log();
  console.log('New Query:');
  console.log('dealers(name, phone, email)');
  console.log();

  console.log('🔧 Response Mapping Changes:');
  console.log('Old Mapping:');
  console.log('dealer_name: booking.dealers?.dealer_name');
  console.log('dealer_phone: booking.dealers?.contact_phone');
  console.log('dealer_email: booking.dealers?.contact_email');
  console.log();
  console.log('New Mapping:');
  console.log('dealer_name: booking.dealers?.name');
  console.log('dealer_phone: booking.dealers?.phone');
  console.log('dealer_email: booking.dealers?.email');
  console.log();

  console.log('📋 Files Fixed:');
  console.log('✅ app/api/bookings/route.ts - Updated dealer column references');
  console.log('✅ app/api/admin/bookings/route.ts - Updated dealer column references');
  console.log();

  console.log('🚀 The booking system should now work correctly!');
  console.log('Try booking a bike again - the dealers table error should be resolved.');
}

// Run the debug
debugDealersTable();