// Get popular bikes for finance section
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getPopularBikesForFinance() {
  console.log('🔍 Getting popular bikes for finance section...\n');

  try {
    // Get popular bikes across different price ranges for better variety
    const { data: bikes, error } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        brands!inner(brand_name, logo_url),
        models!inner(model_name),
        specs!inner(displacement, city_mileage, body_type),
        images!left(url)
      `)
      .not('on_road_price', 'is', null)
      .order('on_road_price', { ascending: true })
      .limit(20);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`✅ Found ${bikes?.length || 0} bikes`);
    
    // Select 4 popular bikes from different price ranges
    const popularBikes = [];
    
    if (bikes && bikes.length > 0) {
      // Get bikes in different price segments
      const budget = bikes.find(b => b.on_road_price <= 80000);
      const midRange = bikes.find(b => b.on_road_price > 80000 && b.on_road_price <= 150000);
      const premium = bikes.find(b => b.on_road_price > 150000 && b.on_road_price <= 250000);
      const luxury = bikes.find(b => b.on_road_price > 250000);
      
      [budget, midRange, premium, luxury].forEach((bike, index) => {
        if (bike) {
          const emiAmount = Math.round(bike.on_road_price * 0.02); // Rough 2% EMI calculation
          popularBikes.push({
            id: index + 1,
            name: `${bike.brands?.brand_name} ${bike.models?.model_name}`,
            price: `₹${bike.on_road_price?.toLocaleString('en-IN')}`,
            emi: `₹${emiAmount.toLocaleString('en-IN')}/month`,
            image: bike.images?.[0]?.url || `/images/bikes/${bike.models?.model_name?.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            href: `/bikes/${bike.models?.model_name?.toLowerCase().replace(/\s+/g, '-')}-${bike.variant_name?.toLowerCase().replace(/\s+/g, '-')}`
          });
          
          console.log(`${index + 1}. ${bike.brands?.brand_name} ${bike.models?.model_name}`);
          console.log(`   Price: ₹${bike.on_road_price?.toLocaleString('en-IN')}`);
          console.log(`   EMI: ₹${emiAmount.toLocaleString('en-IN')}/month`);
          console.log(`   Engine: ${bike.specs?.displacement || 'N/A'}`);
          console.log(`   Mileage: ${bike.specs?.city_mileage || 'N/A'}`);
          console.log('');
        }
      });
    }

    // Output the formatted data for the React component
    console.log('📋 Formatted data for React component:');
    console.log('const featuredBikes = ' + JSON.stringify(popularBikes, null, 2) + ';');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getPopularBikesForFinance();