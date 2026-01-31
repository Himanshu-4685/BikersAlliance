// Simple debugging script to test email status changes
console.log('🔍 Debugging email status changes...');

// First, let's check if we can see any bike submissions
const testAPI = async () => {
  try {
    // Test the API endpoint manually
    console.log('Testing status change API...');
    
    // Mock data to test the email function directly
    const { sendBikeStatusChangeNotification } = require('./lib/sell-bike-email-service.ts');
    
    const testBikeData = {
      id: 1,
      brand: 'Honda',
      model: 'CB Shine',
      variant: 'SP',
      year: '2020',
      expectedPrice: '65000',
      ownerName: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      city: 'Mumbai',
      state: 'Maharashtra'
    };
    
    console.log('🧪 Testing email function directly...');
    const result = await sendBikeStatusChangeNotification(testBikeData, 'approved', 'Test approval');
    console.log('📧 Email function result:', result);
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
};

testAPI();