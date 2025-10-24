const fetch = require('node-fetch');

async function testElectricAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/bikes/category?category=electric');
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testElectricAPI();