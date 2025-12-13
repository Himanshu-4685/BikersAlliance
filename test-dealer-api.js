// Test script to verify dealer API endpoints
// Run this with: node test-dealer-api.js

const BASE_URL = 'http://localhost:3000';

async function testDealerAPIs() {
  console.log('🧪 Testing Dealer API Endpoints...\n');

  try {
    // Test 1: Create a new dealer
    console.log('1. Testing POST /api/dealers - Create new dealer');
    const newDealer = {
      name: 'Test Motors Delhi',
      address: '123 Main Street, Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91-9876543210',
      email: 'test@testmotors.com'
    };

    const createResponse = await fetch(`${BASE_URL}/api/dealers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDealer),
    });

    const createResult = await createResponse.json();
    console.log('✅ Create Response:', createResult);
    console.log('Status:', createResponse.status, '\n');

    const dealerId = createResult.success ? createResult.data.dealer_id : null;

    // Test 2: Get all dealers
    console.log('2. Testing GET /api/dealers - Get all dealers');
    const getAllResponse = await fetch(`${BASE_URL}/api/dealers`);
    const getAllResult = await getAllResponse.json();
    console.log('✅ Get All Response:', {
      success: getAllResult.success,
      dealerCount: getAllResult.data?.dealers?.length || 0,
      totalCount: getAllResult.data?.pagination?.totalCount || 0
    });
    console.log('Status:', getAllResponse.status, '\n');

    // Test 3: Search dealers
    console.log('3. Testing GET /api/dealers/search - Search dealers');
    const searchResponse = await fetch(`${BASE_URL}/api/dealers/search?city=Delhi`);
    const searchResult = await searchResponse.json();
    console.log('✅ Search Response:', {
      success: searchResult.success,
      resultCount: searchResult.data?.length || 0
    });
    console.log('Status:', searchResponse.status, '\n');

    // Test 4: Get specific dealer (if we created one)
    if (dealerId) {
      console.log('4. Testing GET /api/dealers/[id] - Get specific dealer');
      const getOneResponse = await fetch(`${BASE_URL}/api/dealers/${dealerId}`);
      const getOneResult = await getOneResponse.json();
      console.log('✅ Get One Response:', {
        success: getOneResult.success,
        dealerName: getOneResult.data?.name || 'N/A'
      });
      console.log('Status:', getOneResponse.status, '\n');

      // Test 5: Update dealer
      console.log('5. Testing PUT /api/dealers/[id] - Update dealer');
      const updateData = {
        ...newDealer,
        name: 'Updated Test Motors Delhi',
        phone: '+91-9876543211'
      };

      const updateResponse = await fetch(`${BASE_URL}/api/dealers/${dealerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const updateResult = await updateResponse.json();
      console.log('✅ Update Response:', {
        success: updateResult.success,
        updatedName: updateResult.data?.name || 'N/A'
      });
      console.log('Status:', updateResponse.status, '\n');

      // Test 6: Delete dealer
      console.log('6. Testing DELETE /api/dealers/[id] - Delete dealer');
      const deleteResponse = await fetch(`${BASE_URL}/api/dealers/${dealerId}`, {
        method: 'DELETE',
      });

      const deleteResult = await deleteResponse.json();
      console.log('✅ Delete Response:', deleteResult);
      console.log('Status:', deleteResponse.status, '\n');
    }

    console.log('🎉 All dealer API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Error handling for validation tests
async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...\n');

  try {
    // Test invalid data
    console.log('1. Testing POST with invalid data');
    const invalidResponse = await fetch(`${BASE_URL}/api/dealers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '', // Empty name should fail
        city: '',
        state: ''
      }),
    });

    const invalidResult = await invalidResponse.json();
    console.log('✅ Validation Error Response:', invalidResult);
    console.log('Status:', invalidResponse.status, '\n');

    // Test invalid email
    console.log('2. Testing POST with invalid email');
    const invalidEmailResponse = await fetch(`${BASE_URL}/api/dealers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Dealer',
        city: 'Mumbai',
        state: 'Maharashtra',
        email: 'invalid-email' // Invalid email format
      }),
    });

    const invalidEmailResult = await invalidEmailResponse.json();
    console.log('✅ Invalid Email Response:', invalidEmailResult);
    console.log('Status:', invalidEmailResponse.status, '\n');

  } catch (error) {
    console.error('❌ Validation test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  await testDealerAPIs();
  await testValidationErrors();
}

runAllTests();