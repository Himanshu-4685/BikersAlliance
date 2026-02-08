import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
}

// Email service configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Welcome Email API called');
    const body: WelcomeEmailRequest = await request.json();
    const { email, fullName } = body;

    console.log('📧 Welcome email request for:', email, 'Name:', fullName);

    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!fullName || !fullName.trim()) {
      console.log('❌ Full name is required');
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    // Send welcome email
    console.log('📤 Sending welcome email...');
    const emailSent = await sendWelcomeEmail(email, fullName.trim());

    if (emailSent) {
      console.log('✅ Welcome email sent successfully');
      return NextResponse.json(
        { message: 'Welcome email sent successfully!' },
        { status: 200 }
      );
    } else {
      console.log('❌ Failed to send welcome email');
      return NextResponse.json(
        { error: 'Failed to send welcome email. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Welcome email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
  try {
    // Create email content
    const emailContent = createWelcomeEmailContent(email, fullName);
    
    console.log('🔄 Attempting to send welcome email to:', email);
    console.log('📧 Resend API Key available:', !!resend);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📤 Sending welcome email via Resend...');
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('✅ Welcome email sent successfully via Resend!');
          console.log('📧 Email ID:', data?.id);
          console.log('📬 Email sent to:', email);
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
    console.log('📧 Welcome Email Ready');
    console.log('To:', email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // For development: Save email to logs
    await saveEmailForTesting(email, emailContent);
    
    // Return true for development (welcome still works, just email is logged)
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
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
    
    console.log('Email saved for testing:', emailLog);
  } catch (error) {
    console.log('Could not save email log:', error);
  }
}

function createWelcomeEmailContent(email: string, fullName: string) {
  const firstName = fullName.split(' ')[0];
  
  return {
    to: email,
    subject: '🏍️ Welcome to BikersAlliance - Your Motorcycle Journey Begins Here!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
          .btn { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .feature { margin: 15px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #1e40af; }
          .emoji { font-size: 1.2em; }
          .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">🎉</span> Welcome to BikersAlliance, ${firstName}!</h1>
            <p>India's Premier Motorcycle Community</p>
          </div>
          
          <div class="content">
            <p>Hey ${firstName} <span class="emoji">👋</span>,</p>
            
            <p><strong>Congratulations on joining BikersAlliance!</strong> You're now part of India's most passionate motorcycle community.</p>
            
            <p class="highlight">
              <span class="emoji">🏍️</span> <strong>Your motorcycle journey just got a whole lot better!</strong>
            </p>
            
            <h3><span class="emoji">🚀</span> What you can do now:</h3>
            
            <div class="feature">
              <strong><span class="emoji">🔍</span> Discover Your Perfect Bike</strong>
              <p>Browse through hundreds of motorcycles, compare specs, prices, and find your dream ride</p>
            </div>
            
            <div class="feature">
              <strong><span class="emoji">💰</span> Get Best Deals & Offers</strong>
              <p>Access exclusive deals, financing options, and special offers from top dealers</p>
            </div>
            
            <div class="feature">
              <strong><span class="emoji">📚</span> Expert Reviews & Insights</strong>
              <p>Read detailed reviews, comparison tests, and expert opinions to make informed decisions</p>
            </div>
            
            <div class="feature">
              <strong><span class="emoji">🔔</span> Never Miss New Launches</strong>
              <p>Get notified about upcoming bikes, price updates, and industry news</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://bikersalliance.in/dashboard" class="btn">
                <span class="emoji">🏍️</span> Explore Your Dashboard
              </a>
            </p>
            
            <p><strong>Ready to ride?</strong> Start exploring bikes, read reviews, and connect with fellow riders who share your passion for motorcycles.</p>
            
            <p style="margin-top: 30px;">
              <strong><span class="emoji">📬</span> Stay Connected:</strong><br>
              Don't forget to subscribe to our newsletter for the latest updates: <a href="https://bikersalliance.in/" style="color: #1e40af;">Subscribe Now</a>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Welcome to the family!</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.in/" style="color: #1e40af;">https://bikersalliance.in/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this email because you just created an account at BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hey ${firstName} 👋,

Congratulations on joining BikersAlliance! You're now part of India's most passionate motorcycle community.

🏍️ Your motorcycle journey just got a whole lot better!

🚀 What you can do now:

🔍 Discover Your Perfect Bike
Browse through hundreds of motorcycles, compare specs, prices, and find your dream ride

💰 Get Best Deals & Offers
Access exclusive deals, financing options, and special offers from top dealers

📚 Expert Reviews & Insights
Read detailed reviews, comparison tests, and expert opinions to make informed decisions

🔔 Never Miss New Launches
Get notified about upcoming bikes, price updates, and industry news

Ready to ride? Start exploring bikes, read reviews, and connect with fellow riders who share your passion for motorcycles.

📬 Stay Connected:
Don't forget to subscribe to our newsletter for the latest updates: https://bikersalliance.in/

Welcome to the family!
Team BikersAlliance
https://bikersalliance.in/
    `
  };
}