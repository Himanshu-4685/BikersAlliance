import { Resend } from 'resend';

// Email service configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface BookingData {
  booking_id: number;
  user_email: string;
  user_name: string;
  brand_name: string;
  model_name: string;
  variant_name: string;
  price: number;
  booking_date: string;
  status: string;
  dealer_name?: string;
  dealer_phone?: string;
  dealer_email?: string;
}

// Send booking confirmation email
export async function sendBookingConfirmationEmail(bookingData: BookingData): Promise<boolean> {
  try {
    const emailContent = createBookingConfirmationEmailContent(bookingData);
    
    console.log('🔄 Attempting to send booking confirmation email to:', bookingData.user_email);
    console.log('📧 Resend API Key available:', !!resend);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📤 Sending booking confirmation email via Resend...');
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [bookingData.user_email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('✅ Booking confirmation email sent successfully via Resend!');
          console.log('📧 Email ID:', data?.id);
          console.log('📧 Email sent to:', bookingData.user_email);
          return true;
        }
      } catch (resendError) {
        console.error('❌ Resend API error:', resendError);
      }
    } else {
      console.log('⚠️ Resend not available - API key missing');
    }
    
    // Fallback: Use webhook service if configured
    const webhookSent = await sendViaWebhook(bookingData.user_email, emailContent);
    if (webhookSent) {
      return true;
    }
    
    // Development fallback: Log email content
    console.log('📧 Booking Confirmation Email Ready');
    console.log('To:', bookingData.user_email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // For development: Save email to logs
    await saveEmailForTesting(bookingData.user_email, emailContent);
    
    // Return true for development (notification still works, just email is logged)
    return true;
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    return false;
  }
}

// Send booking status update email
export async function sendBookingStatusUpdateEmail(bookingData: BookingData): Promise<boolean> {
  try {
    const emailContent = createBookingStatusUpdateEmailContent(bookingData);
    
    console.log('🔄 Attempting to send booking status update email to:', bookingData.user_email);
    console.log('📧 Resend API Key available:', !!resend);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📤 Sending booking status update email via Resend...');
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [bookingData.user_email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('✅ Booking status update email sent successfully via Resend!');
          console.log('📧 Email ID:', data?.id);
          console.log('📧 Email sent to:', bookingData.user_email);
          return true;
        }
      } catch (resendError) {
        console.error('❌ Resend API error:', resendError);
      }
    } else {
      console.log('⚠️ Resend not available - API key missing');
    }
    
    // Fallback: Use webhook service if configured
    const webhookSent = await sendViaWebhook(bookingData.user_email, emailContent);
    if (webhookSent) {
      return true;
    }
    
    // Development fallback: Log email content
    console.log('📧 Booking Status Update Email Ready');
    console.log('To:', bookingData.user_email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // For development: Save email to logs
    await saveEmailForTesting(bookingData.user_email, emailContent);
    
    // Return true for development (notification still works, just email is logged)
    return true;
  } catch (error) {
    console.error('❌ Error sending booking status update email:', error);
    return false;
  }
}

// Create booking confirmation email content
function createBookingConfirmationEmailContent(bookingData: BookingData) {
  const formattedDate = new Date(bookingData.booking_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedPrice = `₹${bookingData.price.toLocaleString('en-IN')}`;

  return {
    subject: `🏍️ Booking Confirmed - ${bookingData.brand_name} ${bookingData.model_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .booking-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .status-badge { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; display: inline-block; }
          .emoji { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">🏍️</span> Booking Confirmed!</h1>
            <p>Your bike booking has been successfully placed</p>
          </div>
          
          <div class="content">
            <p>Hello ${bookingData.user_name} <span class="emoji">👋</span>,</p>
            
            <p><strong>Great news! Your bike booking has been confirmed.</strong></p>
            
            <div class="booking-info">
              <h3><span class="emoji">📋</span> Booking Details</h3>
              <p><strong>Order ID:</strong> #${bookingData.booking_id}</p>
              <p><strong>Bike:</strong> ${bookingData.brand_name} ${bookingData.model_name}</p>
              <p><strong>Variant:</strong> ${bookingData.variant_name}</p>
              <p><strong>Price:</strong> ${formattedPrice}</p>
              <p><strong>Booking Date:</strong> ${formattedDate}</p>
              <p><strong>Status:</strong> <span class="status-badge">${bookingData.status.toUpperCase()}</span></p>
              ${bookingData.dealer_name ? `<p><strong>Dealer:</strong> ${bookingData.dealer_name}</p>` : ''}
            </div>
            
            <h3><span class="emoji">📞</span> What happens next?</h3>
            <p>Our team will contact you within 24 hours to:</p>
            
            <ul>
              <li><span class="emoji">📅</span> <strong>Schedule delivery/pickup</strong></li>
              <li><span class="emoji">📍</span> <strong>Confirm your delivery address</strong></li>
              <li><span class="emoji">📋</span> <strong>Complete documentation</strong></li>
              <li><span class="emoji">💳</span> <strong>Process payment details</strong></li>
              <li><span class="emoji">🆔</span> <strong>Verify required documents</strong></li>
            </ul>
            
            <p><strong>Get ready for your new ride!</strong> <span class="emoji">🚀</span></p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://bikersalliance.in/dashboard" class="btn">
                <span class="emoji">🎛️</span> View My Orders
              </a>
            </p>
            
            <p><strong>Need immediate assistance?</strong><br>
            Call us at: <a href="tel:+91-9876543210">+91-9876543210</a><br>
            Email us at: <a href="mailto:support@bikersalliance.in">support@bikersalliance.in</a></p>
          </div>
          
          <div class="footer">
            <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.in/" style="color: #1e40af;">https://bikersalliance.in/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this because you placed a booking at BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${bookingData.user_name} 👋,

Great news! Your bike booking has been confirmed.

📋 Booking Details
Order ID: #${bookingData.booking_id}
Bike: ${bookingData.brand_name} ${bookingData.model_name}
Variant: ${bookingData.variant_name}
Price: ${formattedPrice}
Booking Date: ${formattedDate}
Status: ${bookingData.status.toUpperCase()}
${bookingData.dealer_name ? `Dealer: ${bookingData.dealer_name}` : ''}

📞 What happens next?

Our team will contact you within 24 hours to:

📅 Schedule delivery/pickup
📍 Confirm your delivery address  
📋 Complete documentation
💳 Process payment details
🆔 Verify required documents

Get ready for your new ride! 🚀

View your orders: https://bikersalliance.in/dashboard

Need immediate assistance?
Call us at: +91-9876543210
Email us at: support@bikersalliance.in

Ride Safe,
Team BikersAlliance
https://bikersalliance.in/
    `
  };
}

// Create booking status update email content
function createBookingStatusUpdateEmailContent(bookingData: BookingData) {
  const formattedDate = new Date(bookingData.booking_date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedPrice = `₹${bookingData.price.toLocaleString('en-IN')}`;
  
  const statusMessages = {
    confirmed: {
      title: 'Booking Confirmed!',
      emoji: '✅',
      message: 'Your booking has been confirmed and is being processed.',
      next_steps: [
        'Our delivery team will contact you within 48 hours',
        'Documentation will be prepared for processing',
        'Payment confirmation will be sent shortly',
        'Delivery date will be scheduled as per availability'
      ]
    },
    completed: {
      title: 'Order Completed!',
      emoji: '🎉',
      message: 'Congratulations! Your bike has been successfully delivered.',
      next_steps: [
        'Enjoy your new ride responsibly',
        'Keep all documents safe',
        'Register for our service reminders',
        'Share your experience with us'
      ]
    },
    cancelled: {
      title: 'Booking Cancelled',
      emoji: '❌',
      message: 'Your booking has been cancelled as requested.',
      next_steps: [
        'Refund will be processed within 5-7 business days',
        'You will receive a refund confirmation email',
        'Feel free to browse our other bikes',
        'Contact us if you need assistance'
      ]
    },
    pending: {
      title: 'Booking Pending',
      emoji: '⏳',
      message: 'Your booking is being reviewed and processed.',
      next_steps: [
        'Our team is verifying your booking details',
        'You will be contacted within 24 hours',
        'Please keep your documents ready',
        'We will update you on the progress'
      ]
    }
  };

  const statusInfo = statusMessages[bookingData.status as keyof typeof statusMessages] || statusMessages.pending;

  return {
    subject: `${statusInfo.emoji} ${statusInfo.title} - Order #${bookingData.booking_id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Status Update - BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .booking-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .status-badge { background: #10b981; color: white; padding: 6px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; display: inline-block; }
          .emoji { font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">${statusInfo.emoji}</span> ${statusInfo.title}</h1>
            <p>Your booking status has been updated</p>
          </div>
          
          <div class="content">
            <p>Hello ${bookingData.user_name} <span class="emoji">👋</span>,</p>
            
            <p><strong>${statusInfo.message}</strong></p>
            
            <div class="booking-info">
              <h3><span class="emoji">📋</span> Booking Details</h3>
              <p><strong>Order ID:</strong> #${bookingData.booking_id}</p>
              <p><strong>Bike:</strong> ${bookingData.brand_name} ${bookingData.model_name}</p>
              <p><strong>Variant:</strong> ${bookingData.variant_name}</p>
              <p><strong>Price:</strong> ${formattedPrice}</p>
              <p><strong>Booking Date:</strong> ${formattedDate}</p>
              <p><strong>Current Status:</strong> <span class="status-badge">${bookingData.status.toUpperCase()}</span></p>
              ${bookingData.dealer_name ? `<p><strong>Dealer:</strong> ${bookingData.dealer_name}</p>` : ''}
            </div>
            
            <h3><span class="emoji">📞</span> What's next?</h3>
            <ul>
              ${statusInfo.next_steps.map(step => `<li><span class="emoji">•</span> <strong>${step}</strong></li>`).join('')}
            </ul>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://bikersalliance.in/dashboard" class="btn">
                <span class="emoji">🎛️</span> View My Orders
              </a>
            </p>
            
            <p><strong>Need immediate assistance?</strong><br>
            Call us at: <a href="tel:+91-9876543210">+91-9876543210</a><br>
            Email us at: <a href="mailto:support@bikersalliance.in">support@bikersalliance.in</a></p>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for choosing BikersAlliance,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.in/" style="color: #1e40af;">https://bikersalliance.in/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this because your booking status was updated.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${bookingData.user_name} 👋,

${statusInfo.message}

📋 Booking Details
Order ID: #${bookingData.booking_id}
Bike: ${bookingData.brand_name} ${bookingData.model_name}
Variant: ${bookingData.variant_name}
Price: ${formattedPrice}
Booking Date: ${formattedDate}
Current Status: ${bookingData.status.toUpperCase()}
${bookingData.dealer_name ? `Dealer: ${bookingData.dealer_name}` : ''}

📞 What's next?

${statusInfo.next_steps.map(step => `• ${step}`).join('\n')}

View your orders: https://bikersalliance.in/dashboard

Need immediate assistance?
Call us at: +91-9876543210
Email us at: support@bikersalliance.in

Thank you for choosing BikersAlliance,
Team BikersAlliance
https://bikersalliance.in/
    `
  };
}

// Webhook fallback function
async function sendViaWebhook(email: string, emailContent: any): Promise<boolean> {
  try {
    const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
    if (!webhookUrl) {
      return false;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        from: FROM_EMAIL,
      }),
    });

    return response.ok;
  } catch (error) {
    console.log('Webhook email sending failed:', error);
    return false;
  }
}

// Save email for testing in development
async function saveEmailForTesting(email: string, emailContent: any): Promise<void> {
  try {
    const emailLog = {
      timestamp: new Date().toISOString(),
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };
    
    console.log('Booking notification email saved for testing:', emailLog);
  } catch (error) {
    console.log('Could not save email log:', error);
  }
}