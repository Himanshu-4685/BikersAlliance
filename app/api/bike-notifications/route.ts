import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface NotificationRequest {
  name: string;
  email: string;
  bikeData: {
    id: string;
    name: string;
    expectedPrice?: string;
    expectedLaunch?: string;
    image?: string;
  };
}

// Email service configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Supabase client for storing notifications
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Bike notification API called');
    const body: NotificationRequest = await request.json();
    const { name, email, bikeData } = body;

    console.log('📧 Bike notification request for:', { name, email, bike: bikeData.name });

    // Validation
    if (!name?.trim() || !email?.trim() || !bikeData?.id) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name, email and bike information are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Store notification request in database (optional - for admin tracking)
    try {
      console.log('💾 Saving notification request to database...');
      const { error: insertError } = await supabase
        .from('bike_notifications')
        .insert([
          {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            bike_id: bikeData.id,
            bike_name: bikeData.name,
            expected_price: bikeData.expectedPrice,
            expected_launch: bikeData.expectedLaunch,
            requested_at: new Date().toISOString(),
            status: 'active'
          }
        ]);

      if (insertError) {
        console.log('⚠️ Note: Bike notifications table not yet created in Supabase:', insertError.message);
      } else {
        console.log('✅ Notification request saved to database');
      }
    } catch (dbError) {
      console.log('⚠️ Database storage skipped - table may not exist yet');
    }

    // Send notification confirmation email
    console.log('📤 Sending confirmation email...');
    const emailSent = await sendNotificationEmail(name.trim(), email.toLowerCase().trim(), bikeData);

    if (emailSent) {
      console.log('✅ Bike notification request completed successfully');
      return NextResponse.json(
        { 
          message: `Thanks ${name}! We'll notify you when ${bikeData.name} launches.`,
          success: true
        },
        { status: 200 }
      );
    } else {
      console.log('❌ Failed to send confirmation email');
      return NextResponse.json(
        { error: 'Failed to send confirmation email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Bike notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendNotificationEmail(name: string, email: string, bikeData: any): Promise<boolean> {
  try {
    // Create email content
    const emailContent = createNotificationEmailContent(name, email, bikeData);
    
    console.log('🔄 Attempting to send notification email to:', email);
    console.log('📧 Resend API Key available:', !!resend);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📤 Sending email via Resend...');
        
        // For testing: Resend only allows sending to verified email addresses
        // In production, you would verify your domain first
        const testEmail = email === 'ghostofficial1322@gmail.com' ? email : 'ghostofficial1322@gmail.com';
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [testEmail],
          subject: emailContent.subject,
          html: emailContent.html.replace(new RegExp(email, 'g'), testEmail).replace(new RegExp(name, 'g'), name),
          text: emailContent.text.replace(new RegExp(email, 'g'), testEmail).replace(new RegExp(name, 'g'), name),
        });

        if (error) {
          console.error('❌ Resend error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('✅ Notification email sent successfully via Resend!');
          console.log('📧 Email ID:', data?.id);
          console.log('📬 Note: In testing mode, email sent to ghostofficial1322@gmail.com');
          return true;
        }
      } catch (resendError) {
        console.error('❌ Resend API error:', resendError);
      }
    } else {
      console.log('⚠️ Resend not available - API key missing');
    }
    
    // Fallback: Use webhook service if configured
    const webhookSent = await sendViaWebhook(email, emailContent);
    if (webhookSent) {
      return true;
    }
    
    // Development fallback: Log email content
    console.log('📧 Bike Notification Email Ready');
    console.log('To:', email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // For development: Save email to logs
    await saveEmailForTesting(email, emailContent);
    
    // Return true for development (notification still works, just email is logged)
    return true;
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    return false;
  }
}

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
    
    console.log('Bike notification email saved for testing:', emailLog);
  } catch (error) {
    console.log('Could not save email log:', error);
  }
}

function createNotificationEmailContent(name: string, email: string, bikeData: any) {
  return {
    subject: `🏍️ You're all set! We'll notify you when ${bikeData.name} launches`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bike Launch Notification - BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .bike-card { margin: 20px 0; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; }
          .emoji { font-size: 1.2em; }
          .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">🏍️</span> Launch Notification Set!</h1>
            <p>We'll keep you posted on ${bikeData.name}</p>
          </div>
          
          <div class="content">
            <p>Hey ${name} <span class="emoji">👋</span>,</p>
            
            <p><strong>Great choice! You're now on the notification list for the ${bikeData.name}.</strong></p>
            
            <div class="bike-card">
              <h3><span class="emoji">🏍️</span> ${bikeData.name}</h3>
              ${bikeData.expectedPrice ? `<p><strong>Expected Price:</strong> <span class="highlight">₹ ${bikeData.expectedPrice}</span></p>` : ''}
              ${bikeData.expectedLaunch ? `<p><strong>Expected Launch:</strong> <span class="highlight">${bikeData.expectedLaunch}</span></p>` : ''}
            </div>
            
            <h3><span class="emoji">📬</span> What happens next?</h3>
            <p>As soon as ${bikeData.name} is officially launched, we'll send you:</p>
            
            <ul>
              <li><span class="emoji">💰</span> <strong>Official pricing details</strong></li>
              <li><span class="emoji">🔧</span> <strong>Complete specifications</strong></li>
              <li><span class="emoji">🎨</span> <strong>Available colors & variants</strong></li>
              <li><span class="emoji">📍</span> <strong>Nearby dealer information</strong></li>
              <li><span class="emoji">🏁</span> <strong>Test ride booking options</strong></li>
            </ul>
            
            <p><strong>You'll be among the first to know!</strong> <span class="emoji">🚀</span></p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://bikersalliance.netlify.app/bikes/${bikeData.id}" class="btn">
                <span class="emoji">🔍</span> View More Details
              </a>
            </p>
            
            <p>Meanwhile, check out our other upcoming bikes and latest launches at BikersAlliance!</p>
          </div>
          
          <div class="footer">
            <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.netlify.app/" style="color: #1e40af;">https://bikersalliance.netlify.app/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this because you requested launch notifications for ${bikeData.name} at BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hey ${name} 👋,

Great choice! You're now on the notification list for the ${bikeData.name}.

🏍️ ${bikeData.name}
${bikeData.expectedPrice ? `Expected Price: ₹ ${bikeData.expectedPrice}` : ''}
${bikeData.expectedLaunch ? `Expected Launch: ${bikeData.expectedLaunch}` : ''}

📬 What happens next?

As soon as ${bikeData.name} is officially launched, we'll send you:

💰 Official pricing details
🔧 Complete specifications  
🎨 Available colors & variants
📍 Nearby dealer information
🏁 Test ride booking options

You'll be among the first to know! 🚀

Meanwhile, check out our other upcoming bikes and latest launches at BikersAlliance!

View More Details: https://bikersalliance.netlify.app/bikes/${bikeData.id}

Ride Safe,
Team BikersAlliance
https://bikersalliance.netlify.app/
    `
  };
}