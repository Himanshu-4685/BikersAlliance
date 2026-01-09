// Quick API test
async function testAPI() {
  try {
    console.log('ℹ️ The Best Bikes page is now available at:');
    console.log('📄 Frontend: http://localhost:3001/bikes/best');
    console.log('🔗 API: http://localhost:3001/api/best-bikes');
    console.log('');
    
    const response = await fetch('http://localhost:3001/api/best-bikes');
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Found ${data.data.length} best bikes:`);
      console.log('\nTop 5 Results:');
      data.data.slice(0, 5).forEach((bike, index) => {
        console.log(`${index + 1}. ${bike.brand_name} ${bike.model_name} ${bike.variant_name}`);
        console.log(`   💰 Price: ₹${bike.on_road_price.toLocaleString()}`);
        console.log(`   🏍️ Engine: ${bike.displacement}`);
        console.log(`   ⛽ Mileage: ${bike.city_mileage}`);
        console.log('');
      });
    } else {
      console.error('❌ API Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
}

testAPI();