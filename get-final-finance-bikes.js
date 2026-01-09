// Get popular bikes including some premium models for finance section
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFinanceBikes() {
  console.log('🔍 Getting popular bikes with better variety for finance section...\n');

  try {
    // Get a curated list of popular models
    const popularModels = ['Splendor Plus', 'Hunter 350', 'Pulsar', 'Shine', 'Apache', 'Classic 350'];
    
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
      .lte('on_road_price', 250000)
      .order('on_road_price', { ascending: true });

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log(`✅ Found ${bikes?.length || 0} bikes`);
    
    // Find specific popular models
    const selectedBikes = [];
    
    // Look for Hero Splendor Plus
    const splendor = bikes.find(b => 
      b.models?.model_name?.toLowerCase().includes('splendor') && 
      b.brands?.brand_name?.toLowerCase() === 'hero'
    );
    
    // Look for Royal Enfield Hunter 350
    const hunter = bikes.find(b => 
      b.models?.model_name?.toLowerCase().includes('hunter') && 
      b.brands?.brand_name?.toLowerCase() === 'royal enfield'
    );
    
    // Look for Bajaj Pulsar
    const pulsar = bikes.find(b => 
      b.models?.model_name?.toLowerCase().includes('pulsar') && 
      b.brands?.brand_name?.toLowerCase() === 'bajaj'
    );
    
    // Look for TVS Apache
    const apache = bikes.find(b => 
      b.models?.model_name?.toLowerCase().includes('apache') && 
      b.brands?.brand_name?.toLowerCase() === 'tvs'
    );

    const targetBikes = [splendor, hunter, pulsar, apache].filter(Boolean);
    
    // If we don't have 4, fill with other popular bikes
    if (targetBikes.length < 4) {
      const remainingSlots = 4 - targetBikes.length;
      const usedIds = new Set(targetBikes.map(b => b.variant_id));
      const additionalBikes = bikes
        .filter(b => !usedIds.has(b.variant_id))
        .slice(0, remainingSlots);
      targetBikes.push(...additionalBikes);
    }

    targetBikes.slice(0, 4).forEach((bike, index) => {
      const emiAmount = Math.round(bike.on_road_price * 0.022); // 2.2% EMI calculation
      const modelName = bike.models?.model_name;
      const brand = bike.brands?.brand_name;
      
      selectedBikes.push({
        id: index + 1,
        name: `${brand} ${modelName}`,
        price: `₹${bike.on_road_price?.toLocaleString('en-IN')}`,
        emi: `₹${emiAmount.toLocaleString('en-IN')}/month`,
        image: bike.images?.[0]?.url || `/images/bikes/${modelName?.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        href: `/bikes/${modelName?.toLowerCase().replace(/[\s+&]/g, '-').replace(/[()]/g, '')}`
      });
      
      console.log(`${index + 1}. ${brand} ${modelName}`);
      console.log(`   Price: ₹${bike.on_road_price?.toLocaleString('en-IN')}`);
      console.log(`   EMI: ₹${emiAmount.toLocaleString('en-IN')}/month`);
      console.log(`   Engine: ${bike.specs?.displacement || 'N/A'}`);
      console.log(`   Mileage: ${bike.specs?.city_mileage || 'N/A'}`);
      console.log('');
    });

    // Output the formatted data for the React component
    console.log('📋 Final formatted data for React component:');
    console.log('const featuredBikes = ' + JSON.stringify(selectedBikes, null, 2) + ';');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

getFinanceBikes();