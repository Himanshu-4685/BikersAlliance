const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugMileageQuery() {
  console.log('=== Debugging Mileage Category ===\n');

  try {
    // First, let's see what data exists in the specs table
    console.log('1. Checking specs table for city_mileage data...');
    const { data: mileageData, error: mileageError } = await supabase
      .from('specs')
      .select('variant_id, city_mileage')
      .not('city_mileage', 'is', null)
      .limit(10);

    if (mileageError) {
      console.error('Error fetching mileage data:', mileageError);
    } else {
      console.log(`Found ${mileageData?.length || 0} records with city_mileage data:`);
      mileageData?.forEach(spec => {
        console.log(`  - Variant ID: ${spec.variant_id}, Mileage: ${spec.city_mileage}`);
      });
    }

    console.log('\n2. Testing the actual mileage category query...');
    
    // This is the exact query from the API
    const { data: bikes, error } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        brands!inner(brand_name, logo_url),
        models!inner(model_name),
        specs!left(engine_type, displacement, peak_power, city_mileage, body_type),
        images!left(url)
      `)
      .not('specs.city_mileage', 'is', null)
      .lte('on_road_price', 200000)
      .order('on_road_price', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error with mileage query:', error);
    } else {
      console.log(`Found ${bikes?.length || 0} bikes for mileage category:`);
      bikes?.forEach(bike => {
        console.log(`  - ${bike.variant_name}: ₹${bike.on_road_price}, Mileage: ${bike.specs?.city_mileage}`);
      });
    }

    console.log('\n3. Let\'s try a simpler query without the mileage filter...');
    
    const { data: allBikes, error: allError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        brands!inner(brand_name),
        specs!left(city_mileage)
      `)
      .lte('on_road_price', 200000)
      .limit(10);

    if (allError) {
      console.error('Error with simple query:', allError);
    } else {
      console.log(`Simple query found ${allBikes?.length || 0} bikes:`);
      allBikes?.forEach(bike => {
        console.log(`  - ${bike.variant_name}: ₹${bike.on_road_price}, Mileage: ${bike.specs?.city_mileage || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugMileageQuery();