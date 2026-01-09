// Test script for best scooters API
const API_BASE_URL = 'http://localhost:3000/api';

async function testBestScootersAPI() {
  try {
    console.log('Testing Best Scooters API...\n');
    
    const response = await fetch(`${API_BASE_URL}/best-scooters`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('=== BEST SCOOTERS API RESPONSE ===');
    console.log('Success:', data.success);
    console.log('Total scooters:', data.total);
    console.log('Criteria:', JSON.stringify(data.criteria, null, 2));
    
    if (data.data && data.data.length > 0) {
      console.log('\n=== FIRST FEW SCOOTERS ===');
      data.data.slice(0, 5).forEach((scooter, index) => {
        console.log(`${index + 1}. ${scooter.brand_name} ${scooter.model_name} ${scooter.variant_name}`);
        console.log(`   Price: ₹${scooter.on_road_price?.toLocaleString()}`);
        console.log(`   Displacement: ${scooter.displacement}`);
        console.log(`   Mileage: ${scooter.city_mileage}`);
        console.log('');
      });
      
      // Price range analysis
      const prices = data.data.map(s => s.on_road_price).filter(p => p);
      if (prices.length > 0) {
        console.log('=== PRICE ANALYSIS ===');
        console.log(`Cheapest: ₹${Math.min(...prices).toLocaleString()}`);
        console.log(`Most expensive: ₹${Math.max(...prices).toLocaleString()}`);
        console.log(`Average: ₹${Math.round(prices.reduce((a, b) => a + b, 0) / prices.length).toLocaleString()}`);
      }
    } else {
      console.log('\nNo scooters found matching the criteria.');
    }
    
  } catch (error) {
    console.error('Error testing best scooters API:', error);
  }
}

// Run the test
testBestScootersAPI();