// Test script to verify filter functionality
const API_BASE = 'http://localhost:3000';

async function testFilters() {
  console.log('Testing API filters...\n');
  
  // Test 1: Basic API call
  console.log('1. Testing basic API call:');
  try {
    const response = await fetch(`${API_BASE}/api/bikes?limit=3`);
    const data = await response.json();
    console.log(`- Found ${data.data?.bikes?.length || 0} bikes`);
    console.log(`- Total: ${data.data?.pagination?.total || 0}`);
  } catch (error) {
    console.log('- Error:', error.message);
  }
  
  // Test 2: Price filter
  console.log('\n2. Testing price filter (minPrice=50000, maxPrice=100000):');
  try {
    const response = await fetch(`${API_BASE}/api/bikes?minPrice=50000&maxPrice=100000&limit=3`);
    const data = await response.json();
    console.log(`- Found ${data.data?.bikes?.length || 0} bikes in price range`);
    console.log(`- Total: ${data.data?.pagination?.total || 0}`);
    if (data.data?.bikes?.length > 0) {
      data.data.bikes.forEach(bike => {
        console.log(`  - ${bike.name}: ₹${bike.price?.toLocaleString() || 'N/A'}`);
      });
    }
  } catch (error) {
    console.log('- Error:', error.message);
  }
  
  // Test 3: Displacement filter
  console.log('\n3. Testing displacement filter (minDisplacement=150):');
  try {
    const response = await fetch(`${API_BASE}/api/bikes?minDisplacement=150&limit=3`);
    const data = await response.json();
    console.log(`- Found ${data.data?.bikes?.length || 0} bikes with displacement >= 150cc`);
    console.log(`- Total: ${data.data?.pagination?.total || 0}`);
    if (data.data?.bikes?.length > 0) {
      data.data.bikes.forEach(bike => {
        console.log(`  - ${bike.name}: ${bike.specs?.displacement || 'N/A'}`);
      });
    }
  } catch (error) {
    console.log('- Error:', error.message);
  }
  
  // Test 4: Combined filters
  console.log('\n4. Testing combined filters (minPrice=70000, minDisplacement=100):');
  try {
    const response = await fetch(`${API_BASE}/api/bikes?minPrice=70000&minDisplacement=100&limit=3`);
    const data = await response.json();
    console.log(`- Found ${data.data?.bikes?.length || 0} bikes matching both filters`);
    console.log(`- Total: ${data.data?.pagination?.total || 0}`);
    if (data.data?.bikes?.length > 0) {
      data.data.bikes.forEach(bike => {
        console.log(`  - ${bike.name}: ₹${bike.price?.toLocaleString() || 'N/A'}, ${bike.specs?.displacement || 'N/A'}`);
      });
    }
  } catch (error) {
    console.log('- Error:', error.message);
  }
  
  // Test 5: Mileage filter
  console.log('\n5. Testing mileage filter (minMileage=40):');
  try {
    const response = await fetch(`${API_BASE}/api/bikes?minMileage=40&limit=3`);
    const data = await response.json();
    console.log(`- Found ${data.data?.bikes?.length || 0} bikes with mileage >= 40 kmpl`);
    console.log(`- Total: ${data.data?.pagination?.total || 0}`);
    if (data.data?.bikes?.length > 0) {
      data.data.bikes.forEach(bike => {
        console.log(`  - ${bike.name}: ${bike.specs?.mileage || 'N/A'}`);
      });
    }
  } catch (error) {
    console.log('- Error:', error.message);
  }
  
  console.log('\nTest completed!');
}

// Run if called directly
if (require.main === module) {
  testFilters();
}

module.exports = testFilters;