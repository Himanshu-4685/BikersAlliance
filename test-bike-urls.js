// Test script to check if bike detail page URLs are working correctly
const testUrls = [
  'tvs-xl100-heavy-duty',
  'hero-splendor-plus',
  'bajaj-pulsar-ns-160',
  'honda-activa-6g'
];

async function testBikeUrls() {
  console.log('Testing bike detail page URLs...\n');
  
  for (const slug of testUrls) {
    try {
      const response = await fetch(`http://localhost:3000/api/models/${slug}`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ ${slug}: ${result.data.model.name}`);
      } else {
        console.log(`❌ ${slug}: ${result.error || 'Not found'}`);
      }
    } catch (error: any) {
      console.log(`❌ ${slug}: ${error.message}`);
    }
  }
}

// Test category API as well
async function testCategoryApi() {
  console.log('\nTesting category API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/bikes/category?category=commuter');
    const result = await response.json();
    
    if (result.success && result.data.bikes.length > 0) {
      console.log(`✅ Category API: Found ${result.data.bikes.length} commuter bikes`);
      console.log(`   First bike: ${result.data.bikes[0].variant_name} (URL: ${result.data.bikes[0].variant_url})`);
    } else {
      console.log(`❌ Category API: ${result.error || 'No bikes found'}`);
    }
  } catch (error: any) {
    console.log(`❌ Category API: ${error.message}`);
  }
}

// Run tests
testBikeUrls();
testCategoryApi();