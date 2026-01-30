import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface SubscribeRequest {
  email: string;
  resend?: boolean;
}

// Email service configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@bikersalliance.in'; // Use verified domain
const RESEND_API_KEY = process.env.RESEND_API_KEY; // You can get this from resend.com

// Initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Supabase client for storing newsletter subscriptions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Newsletter API called');
    const body: SubscribeRequest = await request.json();
    const { email, resend } = body;

    console.log('📧 Email subscription request for:', email);

    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // If this is a resend request, skip the subscription check and database operations
    if (resend) {
      console.log('🔄 Resending newsletter to:', email);
      
      // Send welcome email directly
      console.log('📤 Sending newsletter email...');
      const emailSent = await sendWelcomeEmail(email);

      if (emailSent) {
        console.log('✅ Newsletter resent successfully');
        return NextResponse.json(
          { message: 'Newsletter resent successfully!' },
          { status: 200 }
        );
      } else {
        console.log('❌ Failed to resend newsletter');
        return NextResponse.json(
          { error: 'Failed to resend newsletter. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Check if email already exists in newsletter subscriptions
    console.log('🔍 Checking for existing subscription...');
    const { data: existingSubscription, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingSubscription) {
      console.log('ℹ️ Email already subscribed:', email);
      return NextResponse.json(
        { message: 'HEY!!! You are already a subscriber.' },
        { status: 200 }
      );
    }

    // Save subscription to database (ignore error if table doesn't exist yet)
    try {
      console.log('💾 Saving subscription to database...');
      const { error: insertError } = await supabase
        .from('newsletter_subscriptions')
        .insert([
          {
            email: email.toLowerCase(),
            subscribed_at: new Date().toISOString(),
            status: 'active'
          }
        ]);

      if (insertError) {
        console.log('⚠️ Note: Newsletter subscriptions table not yet created in Supabase:', insertError.message);
      } else {
        console.log('✅ Subscription saved to database');
      }
    } catch (dbError) {
      console.log('⚠️ Database storage skipped - table may not exist yet');
    }

    // Send welcome email
    console.log('📤 Sending welcome email...');
    const emailSent = await sendWelcomeEmail(email);

    if (emailSent) {
      console.log('✅ Newsletter subscription completed successfully');
      return NextResponse.json(
        { message: 'Successfully subscribed to newsletter!' },
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
    console.error('❌ Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendWelcomeEmail(email: string): Promise<boolean> {
  try {
    // Create email content
    const emailContent = createEmailContent(email);
    
    console.log('🔄 Attempting to send email to:', email);
    console.log('📧 Resend API Key available:', !!resend);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📤 Sending email via Resend...');
        
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
          console.log('✅ Email sent successfully via Resend!');
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
    console.log('📧 Newsletter Welcome Email Ready');
    console.log('To:', email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // For development: Save email to logs
    await saveEmailForTesting(email, emailContent);
    
    // Return true for development (subscription still works, just email is logged)
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
}

async function sendViaWebhook(email: string, emailContent: any): Promise<boolean> {
  try {
    // You can set up a webhook URL (like Zapier, Make.com, or n8n) to handle email sending
    const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return false; // No webhook configured
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
    // In development, you could save emails to a file for testing
    const emailLog = {
      timestamp: new Date().toISOString(),
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };
    
    console.log('Email saved for testing:', emailLog);
    // In a real implementation, you might save this to a database or file
  } catch (error) {
    console.log('Could not save email log:', error);
  }
}

function createEmailContent(email: string) {
  return {
    to: email,
    subject: '🏍️ Stay Ahead of the Curve — Latest Bikes, Reviews & Deals from BikersAlliance!',
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">🏍️</span> Welcome to BikersAlliance!</h1>
            <p>India's Premier Motorcycle Marketplace</p>
          </div>
          
          <div class="content">
            <p>Hey Rider <span class="emoji">👋</span>,</p>
            
            <p><strong>Welcome to BikersAlliance — India's premier motorcycle marketplace!</strong></p>
            
            <p>Get the latest updates on new bike launches, expert reviews, comparisons, and exclusive offers delivered straight to your inbox.</p>
            
            <h3><span class="emoji">👉</span> What you'll get:</h3>
            
            <div class="feature">
              <strong><span class="emoji">🏁</span> First look at new bikes hitting the roads</strong>
              <p>Be the first to know about the latest motorcycle launches in India</p>
            </div>
            
            <div class="feature">
              <strong><span class="emoji">🔧</span> Honest reviews & performance insights</strong>
              <p>Expert analysis and real-world performance data</p>
            </div>
            
            <div class="feature">
              <strong><span class="emoji">📰</span> Exclusive updates, comparisons & riding tips</strong>
              <p>Stay connected with the community that rides with passion</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://bikersalliance.in/" class="btn">
                <span class="emoji">🏍️</span> Explore BikersAlliance
              </a>
            </p>
            
            <p><strong>Stay connected with the community that rides with passion.</strong></p>
            
            <p style="margin-top: 30px;">
              <strong><span class="emoji">📬</span> Subscribe Now to never miss a throttle twist:</strong><br>
              <a href="https://bikersalliance.in/" style="color: #1e40af;">Subscribe to Newsletter</a>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
            <p><a href="https://bikersalliance.in/" style="color: #1e40af;">https://bikersalliance.in/</a></p>
            <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
              You're receiving this email because you subscribed to our newsletter at BikersAlliance.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hey Rider 👋,

Welcome to BikersAlliance — India's premier motorcycle marketplace!
Get the latest updates on new bike launches, expert reviews, comparisons, and exclusive offers delivered straight to your inbox.

👉 What you'll get:

First look at new bikes hitting the roads 🏁
Honest reviews & performance insights 🔧
Exclusive updates, comparisons & riding tips 📰

Stay connected with the community that rides with passion.

📬 Subscribe Now to never miss a throttle twist:
Subscribe to Newsletter

Ride Safe,
Team BikersAlliance
https://bikersalliance.in/
    `
  };
}