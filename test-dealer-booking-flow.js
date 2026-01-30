// Test the full booking flow with dealer selection
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://kdwdwqiwejkwlwccvpyf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkd2R3cWl3ZWprd2x3Y2N2cHlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTY5MTI5MCwiZXhwIjoyMDQ1MjY3MjkwfQ.1_pBnm3J7kZmvtA84hfPQo_SsGE7HYgqjdoGO0bKFxk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookingFlow() {
  console.log('🧪 Testing booking flow with dealer selection...\n');

  try {
    // 1. Get a sample dealer
    console.log('1. Getting sample dealer...');
    const { data: dealers, error: dealersError } = await supabase
      .from('dealers')
      .select('*')
      .limit(1);
    
    if (dealersError) {
      console.error('Error getting dealers:', dealersError);
      return;
    }

    if (!dealers || dealers.length === 0) {
      console.log('❌ No dealers found in database');
      return;
    }

    const dealer = dealers[0];
    console.log('✅ Found dealer:', {
      dealer_id: dealer.dealer_id,
      name: dealer.name,
      state: dealer.state
    });

    // 2. Get a sample variant
    console.log('\n2. Getting sample variant...');
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        price,
        models (
          model_name,
          brands (
            brand_name
          )
        )
      `)
      .limit(1);
    
    if (variantsError) {
      console.error('Error getting variants:', variantsError);
      return;
    }

    if (!variants || variants.length === 0) {
      console.log('❌ No variants found in database');
      return;
    }

    const variant = variants[0];
    console.log('✅ Found variant:', {
      variant_id: variant.variant_id,
      variant_name: variant.variant_name,
      model_name: variant.models?.model_name,
      brand_name: variant.models?.brands?.brand_name,
      price: variant.price
    });

    // 3. Get a test user
    console.log('\n3. Getting test user...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('user_id, email, full_name')
      .limit(1);
    
    if (usersError) {
      console.error('Error getting users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log('✅ Found test user:', {
      user_id: testUser.user_id,
      email: testUser.email,
      full_name: testUser.full_name
    });

    // 4. Create a test booking with dealer
    console.log('\n4. Creating test booking...');
    const bookingData = {
      user_id: testUser.user_id,
      variant_id: variant.variant_id,
      dealer_id: dealer.dealer_id, // This is the key field we're testing
      booking_date: new Date().toISOString(),
      status: 'pending',
      price: variant.price,
      notes: 'Test booking with dealer selection'
    };

    console.log('📤 Booking data:', bookingData);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Error creating booking:', bookingError);
      return;
    }

    console.log('✅ Booking created:', {
      booking_id: booking.booking_id,
      dealer_id: booking.dealer_id,
      status: booking.status
    });

    // 5. Retrieve booking with dealer information
    console.log('\n5. Retrieving booking with dealer info...');
    const { data: retrievedBooking, error: retrieveError } = await supabase
      .from('bookings')
      .select(`
        booking_id,
        user_id,
        variant_id,
        dealer_id,
        booking_date,
        status,
        price,
        notes,
        dealers(
          dealer_id,
          name,
          phone,
          email,
          address,
          city,
          state
        ),
        variants(
          variant_name,
          models(
            model_name,
            brands(
              brand_name
            )
          )
        )
      `)
      .eq('booking_id', booking.booking_id)
      .single();

    if (retrieveError) {
      console.error('❌ Error retrieving booking:', retrieveError);
      return;
    }

    console.log('✅ Retrieved booking with dealer info:', {
      booking_id: retrievedBooking.booking_id,
      dealer_id: retrievedBooking.dealer_id,
      dealer_name: retrievedBooking.dealers?.name,
      dealer_phone: retrievedBooking.dealers?.phone,
      dealer_email: retrievedBooking.dealers?.email,
      bike_info: `${retrievedBooking.variants?.models?.brands?.brand_name} ${retrievedBooking.variants?.models?.model_name} - ${retrievedBooking.variants?.variant_name}`,
      price: retrievedBooking.price
    });

    // 6. Clean up - delete test booking
    console.log('\n6. Cleaning up test booking...');
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('booking_id', booking.booking_id);

    if (deleteError) {
      console.error('❌ Error deleting test booking:', deleteError);
    } else {
      console.log('✅ Test booking cleaned up successfully');
    }

    console.log('\n🎉 Booking flow test completed successfully!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testBookingFlow();