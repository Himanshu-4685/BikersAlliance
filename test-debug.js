// Test the debug API endpoint
async function testDebugAPI() {
  try {
    console.log('Testing debug API endpoint...');
    
    const response = await fetch(`http://localhost:3000/api/debug`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Debug API successful');
      
      console.log('\n=== Body Types ===');
      console.log('Unique body types:', data.data.bodyTypes.unique);
      console.log('Total body type records:', data.data.bodyTypes.data?.length || 0);
      
      console.log('\n=== Variants Sample ===');
      data.data.variants.data?.forEach((variant, index) => {
        console.log(`${index + 1}. ${variant.variant_name} (ID: ${variant.variant_id})`);
      });
      
      console.log('\n=== Specs Sample ===');
      data.data.specs.data?.forEach((spec, index) => {
        console.log(`${index + 1}. Variant ${spec.variant_id}: Body: ${spec.body_type}, Displacement: ${spec.displacement}, Power: ${spec.peak_power}, Mileage: ${spec.city_mileage}`);
      });
      
      console.log('\n=== Join Data Sample ===');
      data.data.joinData.data?.forEach((item, index) => {
        console.log(`${index + 1}. ${item.variant_name}:`);
        console.log(`   - Body: ${item.specs?.body_type || 'N/A'}`);
        console.log(`   - Displacement: ${item.specs?.displacement || 'N/A'}`);
        console.log(`   - Mileage: ${item.specs?.city_mileage || 'N/A'}`);
      });
      
      // Check for any errors
      if (data.data.bodyTypes.error) console.log('Body types error:', data.data.bodyTypes.error);
      if (data.data.variants.error) console.log('Variants error:', data.data.variants.error);
      if (data.data.specs.error) console.log('Specs error:', data.data.specs.error);
      if (data.data.joinData.error) console.log('Join data error:', data.data.joinData.error);
      
    } else {
      console.log('❌ Debug API failed:', data.error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testDebugAPI();