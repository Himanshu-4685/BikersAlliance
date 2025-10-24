// Test script to verify the API endpoint
async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    
    const categories = ['commuter', 'sports', 'cruiser', 'mileage', 'electric'];
    
    for (const category of categories) {
      console.log(`\n--- Testing category: ${category} ---`);
      
      const response = await fetch(`http://localhost:3000/api/bikes/category?category=${category}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ ${category}: Found ${data.data.bikes.length} bikes`);
        if (data.data.bikes.length > 0) {
          const firstBike = data.data.bikes[0];
          console.log(`   Example: ${firstBike.brand_name} ${firstBike.model_name} - ₹${firstBike.on_road_price.toLocaleString()}`);
        }
      } else {
        console.log(`❌ ${category}: ${data.message}`);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAPI();