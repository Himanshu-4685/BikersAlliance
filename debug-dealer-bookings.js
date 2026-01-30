require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBookings() {
  try {
    console.log('🔍 Checking recent bookings...');
    
    // Check recent bookings with dealer information
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        user_id,
        variant_id,
        dealer_id,
        booking_date,
        status,
        price,
        created_at,
        variants(
          variant_name,
          models(
            model_name,
            brands(brand_name)
          )
        ),
        dealers(
          name,
          phone,
          email,
          address,
          city,
          state
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching bookings:', error);
      return;
    }

    console.log('📊 Recent Bookings:');
    bookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking ID: ${booking.booking_id}`);
      console.log(`   Vehicle: ${booking.variants?.models?.brands?.brand_name} ${booking.variants?.models?.model_name} ${booking.variants?.variant_name}`);
      console.log(`   Dealer ID in DB: ${booking.dealer_id}`);
      console.log(`   Dealer Info: ${booking.dealers ? booking.dealers.name : 'NULL'}`);
      if (booking.dealers) {
        console.log(`   Dealer Details: ${booking.dealers.name}, ${booking.dealers.city}, ${booking.dealers.state}`);
        console.log(`   Contact: ${booking.dealers.phone}, ${booking.dealers.email}`);
      }
      console.log(`   Status: ${booking.status}`);
      console.log(`   Created: ${booking.created_at}`);
    });

    // Check if there are any dealers in the database
    console.log('\n🏪 Checking dealers table structure...');
    const { data: dealers, error: dealersError } = await supabase
      .from('dealers')
      .select('*')
      .limit(3);

    if (dealersError) {
      console.error('❌ Error fetching dealers:', dealersError);
      return;
    }

    console.log('Sample dealers:', JSON.stringify(dealers, null, 2));

    // Check bookings table schema
    console.log('\n📋 Checking bookings table schema...');
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_info', { table_name: 'bookings' });
    
    if (!tableError && tableInfo) {
      console.log('Bookings table columns:');
      tableInfo.forEach(col => {
        if (col.column_name.includes('dealer')) {
          console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkBookings();