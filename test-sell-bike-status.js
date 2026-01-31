// Test script for sell bike status changes
// Run this with: node test-sell-bike-status.js

const testStatusChange = async () => {
  try {
    console.log('🧪 Testing bike status change API...');
    
    // Test data - replace with actual bike ID from your database
    const testData = {
      bikeId: 1, // Replace with actual bike ID
      newStatus: 'approved', // or 'rejected'
      adminNotes: 'Your listing looks great! Photos are clear and all information is complete.'
    };
    
    const response = await fetch('http://localhost:3000/api/sell-bike-status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization headers if needed
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Status change successful:', result.message);
      console.log('📧 Email notification should have been sent');
    } else {
      console.error('❌ Status change failed:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error);
  }
};

const testGetSubmissions = async () => {
  try {
    console.log('🧪 Testing get submissions API...');
    
    const response = await fetch('http://localhost:3000/api/sell-bike-status?status=pending&limit=5');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Got submissions:', result.data.length, 'items');
      console.log('📋 Sample submission:', result.data[0]);
    } else {
      console.error('❌ Get submissions failed:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error);
  }
};

// Uncomment to run tests
// testStatusChange();
// testGetSubmissions();

console.log(`
🧪 Sell Bike API Test Instructions:

1. Start your Next.js server: npm run dev
2. Submit a test bike through the form at http://localhost:3000/sell-bike
3. Check the browser console and server logs for email confirmation
4. Use the admin tools or run status change tests to test approval/rejection emails

API Endpoints:
- POST /api/sell-bike (submit new bike)
- GET /api/sell-bike-status (get submissions - admin only)
- PUT /api/sell-bike-status (change status - admin only)

Status Change Test:
- Uncomment testStatusChange() above
- Replace bikeId with actual ID from database
- Run: node test-sell-bike-status.js
`);

module.exports = { testStatusChange, testGetSubmissions };