// Test the formatted API response
async function testFormattedAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/best-bikes');
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      console.log('✅ API Response Sample:');
      console.log(JSON.stringify(data.data[0], null, 2));
      
      // Test the frontend data transformation
      const bike = data.data[0];
      
      // Clean up the bike name - remove duplicate brand names
      let cleanName = bike.variant_name;
      
      // If variant name doesn't start with brand name, add it
      if (!cleanName.toLowerCase().includes(bike.brand_name.toLowerCase())) {
        cleanName = `${bike.brand_name} ${cleanName}`;
      }
      
      // Clean up any duplicate brand/model names
      const brandWords = bike.brand_name.split(' ');
      brandWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\s+${word}\\b`, 'gi');
        cleanName = cleanName.replace(regex, word);
      });
      
      const formattedBike = {
        id: bike.variant_id.toString(),
        name: cleanName,
        slug: bike.variant_id.toString(),
        image: bike.image_url || '/demo.avif',
        price: bike.on_road_price >= 100000 
          ? `${(bike.on_road_price / 100000).toFixed(1)} Lakh`
          : bike.on_road_price.toLocaleString(),
        specs: {
          engine: bike.displacement,
          mileage: bike.city_mileage,
          power: 'N/A'
        }
      };
      
      console.log('\n✅ Formatted for BikeCard:');
      console.log(JSON.stringify(formattedBike, null, 2));
      console.log(`\n🔗 Navigation URL: /bikes/${formattedBike.slug}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFormattedAPI();