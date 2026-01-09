// Get diverse popular bikes for finance section
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
  console.log('🔍 Getting diverse popular bikes for finance section...\n');

  try {
    // Get bikes from different brands and price segments
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
      .gte('on_road_price', 75000)
      .lte('on_road_price', 300000)
      .in('brands.brand_name', ['Hero', 'Bajaj', 'Royal Enfield', 'TVS', 'Honda', 'Yamaha'])
      .order('on_road_price', { ascending: true });

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`✅ Found ${bikes?.length || 0} bikes`);
    
    // Select 4 popular bikes from different brands and price ranges
    const selectedBikes = [];
    const usedBrands = new Set();
    
    if (bikes && bikes.length > 0) {
      for (const bike of bikes) {
        if (selectedBikes.length >= 4) break;
        
        const brand = bike.brands?.brand_name;
        if (!usedBrands.has(brand)) {
          usedBrands.add(brand);
          
          const emiAmount = Math.round(bike.on_road_price * 0.022); // Rough 2.2% EMI calculation
          const modelName = bike.models?.model_name;
          const variantName = bike.variant_name;
          
          // Create clean bike name
          let bikeName = `${brand} ${modelName}`;
          if (variantName && !variantName.toLowerCase().includes(modelName.toLowerCase())) {
            bikeName += ` ${variantName}`;
          }
          
          selectedBikes.push({
            id: selectedBikes.length + 1,
            name: bikeName.length > 35 ? `${brand} ${modelName}` : bikeName,
            price: `₹${bike.on_road_price?.toLocaleString('en-IN')}`,
            emi: `₹${emiAmount.toLocaleString('en-IN')}/month`,
            image: bike.images?.[0]?.url || `/images/bikes/${modelName?.toLowerCase().replace(/\s+/g, '-')}.jpg`,
            href: `/bikes/${modelName?.toLowerCase().replace(/[\s+&]/g, '-').replace(/[()]/g, '')}`
          });
          
          console.log(`${selectedBikes.length}. ${brand} ${modelName}`);
          console.log(`   Price: ₹${bike.on_road_price?.toLocaleString('en-IN')}`);
          console.log(`   EMI: ₹${emiAmount.toLocaleString('en-IN')}/month`);
          console.log(`   Engine: ${bike.specs?.displacement || 'N/A'}`);
          console.log(`   Mileage: ${bike.specs?.city_mileage || 'N/A'}`);
          console.log('');
        }
      }
    }

    // Output the formatted data for the React component
    console.log('📋 Formatted data for React component:');
    console.log('const featuredBikes = ' + JSON.stringify(selectedBikes, null, 2) + ';');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getPopularBikesForFinance();