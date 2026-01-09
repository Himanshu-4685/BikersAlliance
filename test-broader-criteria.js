// Test with broader criteria to see more bikes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testBroaderCriteria() {
  console.log('🔍 Testing with broader criteria...\n');

  try {
    // Test with broader price range (₹1.5L - ₹4L)
    console.log('1️⃣ Testing with broader price range (₹1.5L - ₹4L):');
    const { data: broaderPriceData } = await supabase
      .from('variants')
      .select(`
        brands!inner(brand_name),
        models!inner(model_name),
        variant_name,
        on_road_price,
        specs!inner(displacement, city_mileage)
      `)
      .gte('on_road_price', 150000)
      .lte('on_road_price', 400000)
      .order('on_road_price', { ascending: true });

    const broaderFiltered = broaderPriceData?.filter((bike) => {
      const displacement = bike.specs?.displacement;
      const mileage = bike.specs?.city_mileage;
      
      if (!displacement || !mileage) return false;
      
      const displacementMatch = displacement.match(/(\d+(?:\.\d+)?)/);
      const mileageMatch = mileage.match(/(\d+(?:\.\d+)?)/);
      
      if (!displacementMatch || !mileageMatch) return false;
      
      const displacementNum = parseFloat(displacementMatch[1]);
      const mileageNum = parseFloat(mileageMatch[1]);
      
      return displacementNum >= 250 && 
             displacementNum <= 350 && 
             mileageNum > 40;
    });
    
    console.log(`Found ${broaderFiltered?.length || 0} bikes with broader price range\n`);

    // Test with lower mileage requirement (35+ kmpl)
    console.log('2️⃣ Testing with lower mileage requirement (35+ kmpl):');
    const { data: lowerMileageData } = await supabase
      .from('variants')
      .select(`
        brands!inner(brand_name),
        models!inner(model_name),
        variant_name,
        on_road_price,
        specs!inner(displacement, city_mileage)
      `)
      .gte('on_road_price', 200000)
      .lte('on_road_price', 300000)
      .order('on_road_price', { ascending: true });

    const lowerMileageFiltered = lowerMileageData?.filter((bike) => {
      const displacement = bike.specs?.displacement;
      const mileage = bike.specs?.city_mileage;
      
      if (!displacement || !mileage) return false;
      
      const displacementMatch = displacement.match(/(\d+(?:\.\d+)?)/);
      const mileageMatch = mileage.match(/(\d+(?:\.\d+)?)/);
      
      if (!displacementMatch || !mileageMatch) return false;
      
      const displacementNum = parseFloat(displacementMatch[1]);
      const mileageNum = parseFloat(mileageMatch[1]);
      
      return displacementNum >= 250 && 
             displacementNum <= 350 && 
             mileageNum > 35; // Lowered from 40 to 35
    });
    
    console.log(`Found ${lowerMileageFiltered?.length || 0} bikes with lower mileage requirement\n`);

    // Test with broader displacement range (200cc - 400cc)
    console.log('3️⃣ Testing with broader displacement range (200cc - 400cc):');
    const broaderDisplacementFiltered = lowerMileageData?.filter((bike) => {
      const displacement = bike.specs?.displacement;
      const mileage = bike.specs?.city_mileage;
      
      if (!displacement || !mileage) return false;
      
      const displacementMatch = displacement.match(/(\d+(?:\.\d+)?)/);
      const mileageMatch = mileage.match(/(\d+(?:\.\d+)?)/);
      
      if (!displacementMatch || !mileageMatch) return false;
      
      const displacementNum = parseFloat(displacementMatch[1]);
      const mileageNum = parseFloat(mileageMatch[1]);
      
      return displacementNum >= 200 && 
             displacementNum <= 400 && 
             mileageNum > 40;
    });
    
    console.log(`Found ${broaderDisplacementFiltered?.length || 0} bikes with broader displacement range\n`);

    console.log('💡 Current criteria (₹2-3L, 250-350cc, 40+ kmpl) shows all available bikes.');
    console.log('   To show more bikes, we would need to adjust the criteria.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBroaderCriteria();