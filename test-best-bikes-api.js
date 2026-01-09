// Test script for the Best Bikes API
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBestBikesQuery() {
  console.log('🔍 Testing Best Bikes SQL Query...\n');

  try {
    // Test the exact SQL query provided
    console.log('1️⃣ Testing with raw SQL query:');
    
    const { data: rawData, error: rawError } = await supabase
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

    if (rawError) {
      console.error('❌ Raw query error:', rawError);
    } else {
      console.log(`✅ Raw query successful! Found ${rawData?.length || 0} variants`);
      
      // Filter the data according to displacement and mileage criteria
      const filteredData = rawData?.filter(bike => {
        const displacement = bike.specs?.displacement;
        const mileage = bike.specs?.city_mileage;
        
        if (!displacement || !mileage) return false;
        
        // Extract numeric values - handle both integers and decimal numbers
        const displacementMatch = displacement.match(/(\d+(?:\.\d+)?)/);
        const mileageMatch = mileage.match(/(\d+(?:\.\d+)?)/);
        
        if (!displacementMatch || !mileageMatch) return false;
        
        const displacementNum = parseFloat(displacementMatch[1]);
        const mileageNum = parseFloat(mileageMatch[1]);
        
        return displacementNum >= 250 && 
               displacementNum <= 350 && 
               mileageNum > 40;
      });
      
      console.log(`🎯 After filtering: ${filteredData?.length || 0} bikes match criteria\n`);
      
      if (filteredData && filteredData.length > 0) {
        console.log('📋 Sample results:');
        filteredData.slice(0, 5).forEach((bike, index) => {
          console.log(`${index + 1}. ${bike.brands?.brand_name} ${bike.models?.model_name} ${bike.variant_name}`);
          console.log(`   Price: ₹${bike.on_road_price?.toLocaleString()}`);
          console.log(`   Engine: ${bike.specs?.displacement}`);
          console.log(`   Mileage: ${bike.specs?.city_mileage}\n`);
        });
      }
    }

    // Test if RPC function exists
    console.log('\n2️⃣ Testing RPC function (if created):');
    
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_best_bikes');
    
    if (rpcError) {
      console.log('ℹ️ RPC function not found or error:', rpcError.message);
      console.log('💡 You can create it using the SQL in sql-queries/best-bikes-function.sql');
    } else {
      console.log(`✅ RPC function works! Found ${rpcData?.length || 0} bikes`);
      
      if (rpcData && rpcData.length > 0) {
        console.log('\n📋 RPC Results sample:');
        rpcData.slice(0, 3).forEach((bike, index) => {
          console.log(`${index + 1}. ${bike.brand_name} ${bike.model_name} ${bike.variant_name}`);
          console.log(`   Price: ₹${bike.on_road_price?.toLocaleString()}`);
          console.log(`   Engine: ${bike.displacement}`);
          console.log(`   Mileage: ${bike.city_mileage}\n`);
        });
      }
    }

    // Test API endpoint
    console.log('\n3️⃣ Testing API endpoint:');
    
    try {
      const response = await fetch('http://localhost:3000/api/best-bikes');
      const apiData = await response.json();
      
      if (apiData.success) {
        console.log(`✅ API endpoint works! Found ${apiData.data?.length || 0} bikes`);
        console.log(`📊 Criteria: ${JSON.stringify(apiData.criteria, null, 2)}`);
      } else {
        console.log('❌ API returned error:', apiData.error);
      }
    } catch (apiError) {
      console.log('ℹ️ API endpoint test requires server to be running');
      console.log('Run: npm run dev, then test the endpoint at http://localhost:3000/api/best-bikes');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBestBikesQuery();