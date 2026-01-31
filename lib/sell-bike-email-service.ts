import { Resend } from 'resend';

// Email service configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface BikeSubmissionData {
  id?: number;
  brand: string;
  model: string;
  variant?: string;
  year: string;
  expectedPrice: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

// Send confirmation email when bike is first submitted
export async function sendBikeSubmissionConfirmation(bikeData: BikeSubmissionData): Promise<boolean> {
  try {
    const emailContent = createSubmissionConfirmationEmail(bikeData);
    
    console.log('📤 Sending bike submission confirmation to:', bikeData.email);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📧 Sending via Resend...');
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [bikeData.email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (!error) {
          console.log('✅ Submission confirmation sent successfully via Resend!');
          console.log('📧 Email ID:', data?.id);
          return true;
        } else {
          console.error('❌ Resend error:', error);
        }
      } catch (resendError) {
        console.error('❌ Resend API error:', resendError);
      }
    } else {
      console.log('⚠️ Resend not available - API key missing');
    }
    
    // Fallback: Use webhook service if configured
    const webhookSent = await sendViaWebhook(bikeData.email, emailContent);
    if (webhookSent) {
      return true;
    }
    
    // Development fallback: Log email content
    console.log('📧 Bike Submission Confirmation Email Ready');
    console.log('To:', bikeData.email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // For development: Save email to logs
    await saveEmailForTesting(bikeData.email, emailContent);
    
    return true;
  } catch (error) {
    console.error('❌ Error sending submission confirmation:', error);
    return false;
  }
}

// Send status change notification (approved/rejected)
export async function sendBikeStatusChangeNotification(bikeData: BikeSubmissionData, newStatus: 'approved' | 'rejected', adminNotes?: string): Promise<boolean> {
  try {
    console.log(`🔍 DEBUG: sendBikeStatusChangeNotification called`);
    console.log(`🔍 DEBUG: bikeData:`, bikeData);
    console.log(`🔍 DEBUG: newStatus:`, newStatus);
    console.log(`🔍 DEBUG: adminNotes:`, adminNotes);
    
    const emailContent = createStatusChangeEmail(bikeData, newStatus, adminNotes);
    
    console.log(`📤 Sending bike ${newStatus} notification to:`, bikeData.email);
    console.log(`🔍 DEBUG: Email content subject:`, emailContent.subject);
    
    // Try Resend first
    if (resend) {
      try {
        console.log('📧 Sending via Resend...');
        console.log('🔍 DEBUG: Resend instance exists, calling resend.emails.send');
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [bikeData.email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (!error) {
          console.log(`✅ ${newStatus} notification sent successfully via Resend!`);
          console.log('📧 Email ID:', data?.id);
          return true;
        } else {
          console.error('❌ Resend error:', error);
        }
      } catch (resendError) {
        console.error('❌ Resend API error:', resendError);
      }
    }
    
    // Fallback: Use webhook service if configured
    const webhookSent = await sendViaWebhook(bikeData.email, emailContent);
    if (webhookSent) {
      return true;
    }
    
    // Development fallback: Log email content
    console.log(`📧 Bike ${newStatus} notification ready`);
    console.log('To:', bikeData.email);
    console.log('Subject:', emailContent.subject);
    await saveEmailForTesting(bikeData.email, emailContent);
    
    return true;
  } catch (error) {
    console.error(`❌ Error sending ${newStatus} notification:`, error);
    return false;
  }
}

// Helper functions
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
        from: FROM_EMAIL
      })
    });

    return response.ok;
  } catch (error) {
    console.log('Webhook email sending failed:', error);
    return false;
  }
}

async function saveEmailForTesting(email: string, emailContent: any): Promise<void> {
  try {
    const emailLog = {
      timestamp: new Date().toISOString(),
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };
    
    console.log('Sell bike email saved for testing:', emailLog);
  } catch (error) {
    console.log('Could not save email log:', error);
  }
}

function createSubmissionConfirmationEmail(bikeData: BikeSubmissionData) {
  const bikeName = `${bikeData.brand} ${bikeData.model}${bikeData.variant ? ` ${bikeData.variant}` : ''} (${bikeData.year})`;
  
  return {
    subject: `✅ Your ${bikeName} listing is under review - BikersAlliance`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bike Listing Submitted - BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          .bike-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .status-badge { background: #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .cta-button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .highlight { background: #fef3cd; padding: 15px; border-left: 4px solid #fbbf24; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏍️ Listing Submitted Successfully!</h1>
            <p>Your bike is now under review</p>
          </div>
          
          <div class="content">
            <p>Dear ${bikeData.ownerName},</p>
            
            <p>Thank you for choosing BikersAlliance to sell your bike! We've received your listing and it's currently being reviewed by our team.</p>
            
            <div class="bike-details">
              <h3>📋 Listing Details:</h3>
              <p><strong>Bike:</strong> ${bikeName}</p>
              <p><strong>Expected Price:</strong> ₹${parseInt(bikeData.expectedPrice).toLocaleString('en-IN')}</p>
              <p><strong>Location:</strong> ${bikeData.city}, ${bikeData.state}</p>
              <p><strong>Contact:</strong> ${bikeData.phone}</p>
            </div>
            
            <div class="status-badge">
              🔍 Status: Under Review
            </div>
            
            <div class="highlight">
              <h4>⏰ What happens next?</h4>
              <ul>
                <li><strong>Review Process:</strong> Our team will verify your listing within 24-48 hours</li>
                <li><strong>Approval:</strong> Once approved, your bike will be visible to thousands of potential buyers</li>
                <li><strong>Inquiries:</strong> You'll receive buyer inquiries directly on your phone/email</li>
                <li><strong>Updates:</strong> We'll notify you via email about any status changes</li>
              </ul>
            </div>
            
            <p><strong>Need to make changes?</strong> Contact us at <a href="mailto:support@bikersalliance.in">support@bikersalliance.com</a> with your listing details.</p>
            
            <p>Thank you for trusting BikersAlliance with your bike sale!</p>
            
            <a href="https://bikersalliance.in/used-bikes" class="cta-button">Browse Other Listings</a>
          </div>
          
          <div class="footer">
            <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.in/" style="color: #1e40af;">https://bikersalliance.in/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this email because you submitted a bike listing on BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🏍️ Listing Submitted Successfully!

Dear ${bikeData.ownerName},

Thank you for choosing BikersAlliance to sell your bike! We've received your listing and it's currently being reviewed by our team.

📋 Listing Details:
Bike: ${bikeName}
Expected Price: ₹${parseInt(bikeData.expectedPrice).toLocaleString('en-IN')}
Location: ${bikeData.city}, ${bikeData.state}
Contact: ${bikeData.phone}

🔍 Status: Under Review

⏰ What happens next?
• Review Process: Our team will verify your listing within 24-48 hours
• Approval: Once approved, your bike will be visible to thousands of potential buyers
• Inquiries: You'll receive buyer inquiries directly on your phone/email
• Updates: We'll notify you via email about any status changes

Need to make changes? Contact us at support@bikersalliance.com with your listing details.

Thank you for trusting BikersAlliance with your bike sale!

Ride Safe,
Team BikersAlliance

https://bikersalliance.netlify.app/
    `
  };
}

function createStatusChangeEmail(bikeData: BikeSubmissionData, status: 'approved' | 'rejected', adminNotes?: string) {
  const bikeName = `${bikeData.brand} ${bikeData.model}${bikeData.variant ? ` ${bikeData.variant}` : ''} (${bikeData.year})`;
  const isApproved = status === 'approved';
  
  return {
    subject: `${isApproved ? '🎉 Listing Approved' : '❌ Listing Update'} - ${bikeName} - BikersAlliance`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bike Listing ${isApproved ? 'Approved' : 'Update'} - BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${isApproved ? '#10b981, #059669' : '#dc2626, #ef4444'}); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          .bike-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .status-badge { background: ${isApproved ? '#34d399' : '#f87171'}; color: ${isApproved ? '#065f46' : '#7f1d1d'}; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 10px 0; }
          .cta-button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .highlight { background: ${isApproved ? '#d1fae5' : '#fee2e2'}; padding: 15px; border-left: 4px solid ${isApproved ? '#10b981' : '#ef4444'}; margin: 20px 0; }
          .admin-notes { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '🎉 Congratulations!' : '📝 Listing Update'}</h1>
            <p>Your bike listing has been ${status}</p>
          </div>
          
          <div class="content">
            <p>Dear ${bikeData.ownerName},</p>
            
            ${isApproved ? `
              <p>Great news! Your bike listing has been approved and is now <strong>live on BikersAlliance</strong>. Potential buyers can now view and contact you about your bike.</p>
            ` : `
              <p>We've reviewed your bike listing, but unfortunately it cannot be approved at this time. Please see the details below for more information.</p>
            `}
            
            <div class="bike-details">
              <h3>📋 Listing Details:</h3>
              <p><strong>Bike:</strong> ${bikeName}</p>
              <p><strong>Expected Price:</strong> ₹${parseInt(bikeData.expectedPrice).toLocaleString('en-IN')}</p>
              <p><strong>Location:</strong> ${bikeData.city}, ${bikeData.state}</p>
            </div>
            
            <div class="status-badge">
              ${isApproved ? '✅ Status: Live & Active' : '❌ Status: Not Approved'}
            </div>
            
            ${adminNotes ? `
              <div class="admin-notes">
                <h4>📝 Review Notes:</h4>
                <p>${adminNotes}</p>
              </div>
            ` : ''}
            
            <div class="highlight">
              ${isApproved ? `
                <h4>🎯 What happens now?</h4>
                <ul>
                  <li><strong>Your listing is live:</strong> Buyers can now see your bike</li>
                  <li><strong>Expect inquiries:</strong> You'll receive calls/messages from interested buyers</li>
                  <li><strong>Stay responsive:</strong> Quick responses lead to faster sales</li>
                  <li><strong>Safety first:</strong> Meet buyers in public places and verify payments</li>
                </ul>
              ` : `
                <h4>📋 Next Steps:</h4>
                <ul>
                  <li><strong>Review the feedback:</strong> Check the notes above for specific issues</li>
                  <li><strong>Make corrections:</strong> Address any issues mentioned</li>
                  <li><strong>Resubmit:</strong> You can submit a new listing with the corrections</li>
                  <li><strong>Need help?</strong> Contact our support team for assistance</li>
                </ul>
              `}
            </div>
            
            ${isApproved ? `
              <p><strong>View your live listing:</strong> <a href="https://bikersalliance.netlify.app/used-bikes">Browse Used Bikes</a></p>
            ` : `
              <p><strong>Need assistance?</strong> Contact us at <a href="mailto:support@bikersalliance.com">support@bikersalliance.com</a></p>
            `}
            
            <p>Thank you for choosing BikersAlliance!</p>
            
            <a href="https://bikersalliance.netlify.app/sell-bike" class="cta-button">
              ${isApproved ? 'Sell Another Bike' : 'Submit New Listing'}
            </a>
          </div>
          
          <div class="footer">
            <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.netlify.app/" style="color: #1e40af;">https://bikersalliance.netlify.app/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this email because you have a bike listing on BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
${isApproved ? '🎉 Congratulations!' : '📝 Listing Update'}

Dear ${bikeData.ownerName},

${isApproved ? `
Great news! Your bike listing has been approved and is now live on BikersAlliance. Potential buyers can now view and contact you about your bike.
` : `
We've reviewed your bike listing, but unfortunately it cannot be approved at this time. Please see the details below for more information.
`}

📋 Listing Details:
Bike: ${bikeName}
Expected Price: ₹${parseInt(bikeData.expectedPrice).toLocaleString('en-IN')}
Location: ${bikeData.city}, ${bikeData.state}

${isApproved ? '✅ Status: Live & Active' : '❌ Status: Not Approved'}

${adminNotes ? `
📝 Review Notes:
${adminNotes}
` : ''}

${isApproved ? `
🎯 What happens now?
• Your listing is live: Buyers can now see your bike
• Expect inquiries: You'll receive calls/messages from interested buyers
• Stay responsive: Quick responses lead to faster sales
• Safety first: Meet buyers in public places and verify payments
` : `
📋 Next Steps:
• Review the feedback: Check the notes above for specific issues
• Make corrections: Address any issues mentioned
• Resubmit: You can submit a new listing with the corrections
• Need help? Contact our support team for assistance
`}

${isApproved ? `
View your live listing: https://bikersalliance.netlify.app/used-bikes
` : `
Need assistance? Contact us at support@bikersalliance.com
`}

Thank you for choosing BikersAlliance!

Ride Safe,
Team BikersAlliance

https://bikersalliance.netlify.app/
    `
  };
}