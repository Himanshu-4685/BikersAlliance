// Test script for welcome email functionality
// Run this with: node test-welcome-email.js

const testWelcomeEmailAPI = async () => {
  try {
    const testData = {
      email: 'test@example.com',
      fullName: 'John Doe'
    };

    console.log('🧪 Testing Welcome Email API...');
    console.log('📧 Test data:', testData);

    const response = await fetch('http://localhost:3000/api/auth/welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', result);

    if (response.ok) {
      console.log('✅ Welcome Email API test passed!');
    } else {
      console.log('❌ Welcome Email API test failed!');
    }
  } catch (error) {
    console.error('❌ Error testing welcome email API:', error);
  }
};

// Test invalid data scenarios
const testValidation = async () => {
  console.log('\n🧪 Testing validation scenarios...');

  // Test missing email
  try {
    const response = await fetch('http://localhost:3000/api/auth/welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName: 'John Doe' }),
    });
    
    const result = await response.json();
    console.log('📧 Missing email test - Status:', response.status, 'Result:', result);
  } catch (error) {
    console.error('❌ Missing email test error:', error);
  }

  // Test missing fullName
  try {
    const response = await fetch('http://localhost:3000/api/auth/welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    const result = await response.json();
    console.log('👤 Missing name test - Status:', response.status, 'Result:', result);
  } catch (error) {
    console.error('❌ Missing name test error:', error);
  }

  // Test invalid email format
  try {
    const response = await fetch('http://localhost:3000/api/auth/welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'invalid-email', fullName: 'John Doe' }),
    });
    
    const result = await response.json();
    console.log('🚫 Invalid email test - Status:', response.status, 'Result:', result);
  } catch (error) {
    console.error('❌ Invalid email test error:', error);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting Welcome Email API Tests...\n');
  
  await testWelcomeEmailAPI();
  await testValidation();
  
  console.log('\n🏁 Tests completed!');
  console.log('\n📝 Notes:');
  console.log('- Make sure the dev server is running (npm run dev)');
  console.log('- In development mode, emails will be logged to console');
  console.log('- For production, set up RESEND_API_KEY environment variable');
  console.log('- Check the server console for detailed email logs');
};

// Only run if this is the main module
if (typeof module !== 'undefined' && require.main === module) {
  runTests();
}

module.exports = { testWelcomeEmailAPI, testValidation };