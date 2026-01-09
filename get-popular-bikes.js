const fetch = require('node-fetch');

async function getPopularBikes() {
  try {
    const response = await fetch('http://localhost:3000/api/bikes?limit=8&sortBy=on_road_price&sortOrder=asc');
    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('Popular Bikes found:', data.data.length);
      data.data.slice(0, 4).forEach((bike, index) => {
        console.log(`${index + 1}. ${bike.brands?.brand_name} ${bike.models?.model_name} ${bike.variant_name}`);
        console.log(`   Price: ₹${bike.on_road_price?.toLocaleString()}`);
        console.log(`   Engine: ${bike.specs?.displacement || 'N/A'}`);
        console.log(`   Mileage: ${bike.specs?.city_mileage || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

getPopularBikes();