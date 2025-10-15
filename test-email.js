// Test the Resend configuration
// Run this with: node test-email.js

const { Resend } = require('resend');

const resend = new Resend('re_bxoV86Sb_8gszziuPvnKBnzkSQnYA4ZK5');

async function testEmail() {
  console.log('🧪 Testing Resend email configuration...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'BikersAlliance <onboarding@resend.dev>',
      to: ['ghostofficial1322@gmail.com'], // Your verified email address
      subject: '🧪 Test Email from BikersAlliance',
      html: '<h1>Test Email</h1><p>If you receive this, the setup is working!</p>',
      text: 'Test Email - If you receive this, the setup is working!'
    });

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Email sent successfully!');
      console.log('📧 Email ID:', data.id);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testEmail();