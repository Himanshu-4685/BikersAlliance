// Test script to verify email functionality for status changes
// This script simulates changing a bike status from pending to approved

const testStatusChangeEmail = async () => {
  try {
    console.log('🧪 Testing status change email functionality...');
    
    // Test data (simulating a bike submission)
    const testBikeData = {
      id: 123,
      brand: 'Honda',
      model: 'CB Shine',
      variant: 'SP',
      year: '2020',
      expectedPrice: '65000',
      ownerName: 'Test User',
      email: 'test@example.com', // This will now be sent to actual email instead of test email
      phone: '9876543210',
      city: 'Mumbai',
      state: 'Maharashtra'
    };

    // Test API endpoint for status change
    const response = await fetch('http://localhost:3000/api/sell-bike-status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bikeId: testBikeData.id,
        newStatus: 'approved',
        adminNotes: 'Great listing! All details look perfect. Your bike is now live on our platform.'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Status change successful!');
      console.log('📧 Email should have been sent to:', testBikeData.email);
      console.log('📋 Response:', result);
    } else {
      console.log('❌ Status change failed:', result.error);
    }

  } catch (error) {
    console.error('🚨 Test failed:', error);
  }
};

// Run the test
testStatusChangeEmail();