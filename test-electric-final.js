// Test script to check electric bikes API
async function testElectricAPI() {
  try {
    console.log('Testing electric bikes API...');
    
    // Use node-fetch if available, otherwise try native fetch
    let fetch;
    try {
      fetch = (await import('node-fetch')).default;
    } catch (e) {
      fetch = globalThis.fetch;
    }
    
    const response = await fetch('http://localhost:3000/api/bikes/category?category=electric');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data && data.data.bikes) {
      console.log(`Found ${data.data.bikes.length} electric bikes:`);
      data.data.bikes.forEach((bike, index) => {
        console.log(`${index + 1}. ${bike.variant_name} - ₹${bike.on_road_price}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing electric API:', error.message);
  }
}

testElectricAPI();