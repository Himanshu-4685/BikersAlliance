// Quick test script for bike offers email functionality
// Run with: node test-offers-email.js

const testOfferRequest = async () => {
  const testData = {
    name: "Test User",
    email: "test@example.com",
    mobile: "9876543210",
    offerId: 1,
    bikeName: "Hero Splendor Plus",
    dealerName: "Hero World",
    offerTitle: "Year End Mega Sale",
    offerPrice: 67000,
    originalPrice: 74856,
    discountPercent: 10.5
  };

  try {
    console.log('🧪 Testing bike offer request with email...');
    console.log('Test data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/offer-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test passed!');
      console.log('Response:', result);
      console.log('Email sent:', result.emailSent ? 'Yes' : 'No');
    } else {
      console.log('❌ Test failed!');
      console.log('Error:', result);
    }
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
};

// Instructions for manual testing
console.log(`
🧪 BIKE OFFERS EMAIL TEST INSTRUCTIONS

1. Start the development server:
   cd "c:\\Users\\himan\\Desktop\\bikersalliance\\Bike-website-main\\BikersAlliance"
   npm run dev

2. Visit: http://localhost:3000/bikes/offers

3. Click "Get This Offer" on any bike

4. Fill the form with:
   - Name: Your Name
   - Email: your.email@example.com (or ghostofficial1322@gmail.com for testing)
   - Mobile: 10-digit number

5. Submit and check:
   - Success message appears
   - Console logs show email activity
   - Check your inbox for confirmation email

To run this automated test (after starting server):
node test-offers-email.js
`);

// Uncomment to run automated test (requires server running)
// testOfferRequest();