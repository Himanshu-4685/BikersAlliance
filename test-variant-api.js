// Test script to check variant creation API response
async function testVariantCreation() {
  const testData = {
    variant_name: "Test Variant",
    model_id: "1", // Replace with actual model ID
    brand_id: "1", // Replace with actual brand ID
    on_road_price: "100000"
  };

  try {
    const response = await fetch('/api/admin/variants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Response:', result);
    console.log('Variant ID:', result.variant?.variant_id);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function
// testVariantCreation();