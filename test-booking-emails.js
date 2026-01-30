// Test script for booking email notifications
// Run this with: node test-booking-emails.js

const { sendBookingConfirmationEmail, sendBookingStatusUpdateEmail } = require('./lib/email-booking.ts');

// Test data for booking confirmation
const testBookingData = {
  booking_id: 12345,
  user_email: 'test@example.com', // Replace with your test email
  user_name: 'John Doe',
  brand_name: 'TVS',
  model_name: 'Scooty Pep Plus',
  variant_name: 'Glossy',
  price: 76694,
  booking_date: new Date().toISOString(),
  status: 'pending',
  dealer_name: 'TVS Showroom Mumbai',
  dealer_phone: '+91-9876543210',
  dealer_email: 'dealer@tvs.com'
};

// Test data for status update
const testStatusUpdateData = {
  ...testBookingData,
  status: 'confirmed'
};

async function testBookingConfirmation() {
  console.log('🧪 Testing booking confirmation email...');
  try {
    const result = await sendBookingConfirmationEmail(testBookingData);
    console.log(result ? '✅ Success!' : '❌ Failed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testStatusUpdate() {
  console.log('🧪 Testing booking status update email...');
  try {
    const result = await sendBookingStatusUpdateEmail(testStatusUpdateData);
    console.log(result ? '✅ Success!' : '❌ Failed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function runTests() {
  console.log('📧 Starting Email Notification Tests');
  console.log('=====================================');
  
  await testBookingConfirmation();
  console.log('');
  
  await testStatusUpdate();
  console.log('');
  
  console.log('🏁 Tests completed!');
  console.log('Check your email (including spam folder) or console logs for results.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testBookingConfirmation,
  testStatusUpdate,
  runTests
};