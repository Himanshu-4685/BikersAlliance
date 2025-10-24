// Simple test to check what brands exist in the database
async function testBrands() {
  try {
    const response = await fetch('http://localhost:3000/api/brands');
    const data = await response.json();
    console.log('Available brands:', data);
  } catch (error) {
    console.error('Error fetching brands:', error);
  }
}

testBrands();