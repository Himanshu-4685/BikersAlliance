// Test script for scooters API endpoint
const testScootersAPI = async () => {
  try {
    console.log('Testing /api/bikes/scooters endpoint...');
    
    const response = await fetch('http://localhost:3000/api/bikes/scooters');
    const data = await response.json();
    
    console.log('API Response:', {
      success: data.success,
      bikesCount: data.data?.bikes?.length || 0,
      message: data.message
    });
    
    if (data.success && data.data?.bikes?.length > 0) {
      console.log('\nFirst few scooters:');
      data.data.bikes.slice(0, 3).forEach((scooter, index) => {
        console.log(`${index + 1}. ${scooter.variant_name} - ${scooter.bike_style}`);
      });
      
      // Verify all are scooters
      const nonScooters = data.data.bikes.filter(bike => 
        !bike.bike_style?.toLowerCase().includes('scooter')
      );
      
      if (nonScooters.length === 0) {
        console.log('\n✅ All vehicles have scooter body type!');
      } else {
        console.log('\n❌ Found non-scooters:', nonScooters.length);
        nonScooters.forEach(bike => {
          console.log(`- ${bike.variant_name}: ${bike.bike_style}`);
        });
      }
    } else {
      console.log('❌ No scooters found or API error');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testScootersAPI();
}

module.exports = testScootersAPI;