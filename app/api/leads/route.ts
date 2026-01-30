import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Email service configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      phone,
      email,
      address,
      pincode,
      variant_id,
      bike_name,
      variant_name,
      brand_name,
      lead_type
    } = await request.json();

    // Input validation
    if (!name || !phone || !email || !address || !pincode || !variant_id || !bike_name || !variant_name || !brand_name || !lead_type) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate lead type
    if (!['get_on_road_price', 'book_test_ride'].includes(lead_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid lead type' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic check for digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Validate pincode (6 digits)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pincode' },
        { status: 400 }
      );
    }

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        pincode: pincode.trim(),
        variant_id: parseInt(variant_id),
        bike_name: bike_name.trim(),
        variant_name: variant_name.trim(),
        brand_name: brand_name.trim(),
        lead_type,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      );
    }

    // Send notification email
    console.log('📤 Sending notification email...');
    const emailSent = await sendLeadNotificationEmail(data);
    
    if (!emailSent) {
      console.log('⚠️ Email notification failed, but lead was saved successfully');
    }

    return NextResponse.json({
      success: true,
      lead: data,
      message: 'Form submitted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadType = searchParams.get('lead_type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    if (leadType && ['get_on_road_price', 'book_test_ride'].includes(leadType)) {
      query = query.eq('lead_type', leadType);
    }

    if (status && ['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      query = query.eq('status', status);
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leads: leads || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Email notification functions
async function sendLeadNotificationEmail(leadData: any): Promise<boolean> {
  try {
    // Create email content based on lead type
    const emailContent = createLeadEmailContent(leadData);
    
    console.log('🔄 Attempting to send lead notification email to:', leadData.email);
    console.log('📧 Resend API Key available:', !!resend);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📤 Sending email via Resend...');
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [leadData.email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('✅ Lead notification email sent successfully via Resend!');
          console.log('📧 Email ID:', data?.id);
          console.log('📧 Email sent to:', leadData.email);
          return true;
        }
      } catch (resendError) {
        console.error('❌ Resend API error:', resendError);
      }
    } else {
      console.log('⚠️ Resend not available - API key missing');
    }
    
    // Fallback: Use webhook service if configured
    const webhookSent = await sendViaWebhook(leadData.email, emailContent);
    if (webhookSent) {
      return true;
    }
    
    // Development fallback: Log email content
    console.log('📧 Lead Notification Email Ready');
    console.log('To:', leadData.email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // For development: Save email to logs
    await saveEmailForTesting(leadData.email, emailContent);
    
    // Return true for development (notification still works, just email is logged)
    return true;
  } catch (error) {
    console.error('❌ Error sending lead notification email:', error);
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
        from: FROM_EMAIL,
      }),
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
    
    console.log('Lead notification email saved for testing:', emailLog);
  } catch (error) {
    console.log('Could not save email log:', error);
  }
}

function createLeadEmailContent(leadData: any) {
  const isTestRide = leadData.lead_type === 'book_test_ride';
  const isPriceRequest = leadData.lead_type === 'get_on_road_price';

  if (isTestRide) {
    return {
      subject: `🏍️ Test Ride Confirmed for ${leadData.bike_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Ride Confirmation - BikersAlliance</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .btn { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            .emoji { font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1><span class="emoji">🏍️</span> Test Ride Confirmed!</h1>
              <p>Your test ride request for ${leadData.bike_name} has been received</p>
            </div>
            
            <div class="content">
              <p>Hey ${leadData.name} <span class="emoji">👋</span>,</p>
              
              <p><strong>Great news! Your test ride request has been confirmed.</strong></p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3><span class="emoji">🏍️</span> ${leadData.bike_name}</h3>
                <p><strong>Variant:</strong> ${leadData.variant_name}</p>
                <p><strong>Brand:</strong> ${leadData.brand_name}</p>
                <p><strong>Your Contact:</strong> ${leadData.phone}</p>
                <p><strong>Location:</strong> ${leadData.address}, ${leadData.pincode}</p>
              </div>
              
              <h3><span class="emoji">📞</span> What happens next?</h3>
              <p>Our team will contact you within 24 hours to:</p>
              
              <ul>
                <li><span class="emoji">📅</span> <strong>Schedule your test ride</strong></li>
                <li><span class="emoji">📍</span> <strong>Confirm the nearest dealership</strong></li>
                <li><span class="emoji">📋</span> <strong>Verify required documents</strong></li>
                <li><span class="emoji">🆔</span> <strong>Complete necessary formalities</strong></li>
              </ul>
              
              <p><strong>Get ready for an amazing ride!</strong> <span class="emoji">🚀</span></p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://bikersalliance.in/" class="btn">
                  <span class="emoji">🌐</span> Visit BikersAlliance
                </a>
              </p>
              
              <p><strong>Need immediate assistance?</strong><br>
              Call us at: <a href="tel:+91-9876543210">+91-9876543210</a><br>
              Email us at: <a href="mailto:support@bikersalliance.in">support@bikersalliance.com</a></p>
            </div>
            
            <div class="footer">
              <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
              <p><a href="https://bikersalliance.in/" style="color: #1e40af;">https://bikersalliance.in/</a></p>
              <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
                You're receiving this because you requested a test ride at BikersAlliance.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hey ${leadData.name} 👋,

Great news! Your test ride request has been confirmed.

🏍️ ${leadData.bike_name}
Variant: ${leadData.variant_name}
Brand: ${leadData.brand_name}
Your Contact: ${leadData.phone}
Location: ${leadData.address}, ${leadData.pincode}

📞 What happens next?

Our team will contact you within 24 hours to:

📅 Schedule your test ride
📍 Confirm the nearest dealership  
📋 Verify required documents
🆔 Complete necessary formalities

Get ready for an amazing ride! 🚀

Need immediate assistance?
Call us at: +91-9876543210
Email us at: support@bikersalliance.com

Ride Safe,
Team BikersAlliance
https://bikersalliance.netlify.app/
      `
    };
  } else if (isPriceRequest) {
    return {
      subject: `💰 On-Road Price Details for ${leadData.bike_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Price Request Confirmation - BikersAlliance</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .btn { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
            .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
            .emoji { font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1><span class="emoji">💰</span> Price Request Received!</h1>
              <p>We'll get you the best on-road price for ${leadData.bike_name}</p>
            </div>
            
            <div class="content">
              <p>Hey ${leadData.name} <span class="emoji">👋</span>,</p>
              
              <p><strong>Thank you for your interest in getting the on-road price details!</strong></p>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3><span class="emoji">🏍️</span> ${leadData.bike_name}</h3>
                <p><strong>Variant:</strong> ${leadData.variant_name}</p>
                <p><strong>Brand:</strong> ${leadData.brand_name}</p>
                <p><strong>Your Contact:</strong> ${leadData.phone}</p>
                <p><strong>Location:</strong> ${leadData.address}, ${leadData.pincode}</p>
              </div>
              
              <h3><span class="emoji">📊</span> What you'll receive:</h3>
              <p>Our team will contact you within 24 hours with:</p>
              
              <ul>
                <li><span class="emoji">💰</span> <strong>Complete on-road price breakdown</strong></li>
                <li><span class="emoji">📄</span> <strong>Registration & insurance costs</strong></li>
                <li><span class="emoji">🎯</span> <strong>Available offers & discounts</strong></li>
                <li><span class="emoji">💳</span> <strong>Finance options & EMI details</strong></li>
                <li><span class="emoji">📍</span> <strong>Nearby authorized dealers</strong></li>
              </ul>
              
              <p><strong>Get the best deal on your dream bike!</strong> <span class="emoji">🎯</span></p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://bikersalliance.in/" class="btn">
                  <span class="emoji">🌐</span> Visit BikersAlliance
                </a>
              </p>
              
              <p><strong>Need immediate assistance?</strong><br>
              Call us at: <a href="tel:+91-9876543210">+91-9876543210</a><br>
              Email us at: <a href="mailto:support@bikersalliance.in">support@bikersalliance.in</a></p>
            </div>
            
            <div class="footer">
              <p><strong>Ride Safe,</strong><br>Team BikersAlliance</p>
              <p><a href="https://bikersalliance.in/" style="color: #dc2626;">https://bikersalliance.in/</a></p>
              <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
                You're receiving this because you requested pricing information at BikersAlliance.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hey ${leadData.name} 👋,

Thank you for your interest in getting the on-road price details!

🏍️ ${leadData.bike_name}
Variant: ${leadData.variant_name}
Brand: ${leadData.brand_name}
Your Contact: ${leadData.phone}
Location: ${leadData.address}, ${leadData.pincode}

📊 What you'll receive:

Our team will contact you within 24 hours with:

💰 Complete on-road price breakdown
📄 Registration & insurance costs
🎯 Available offers & discounts  
💳 Finance options & EMI details
📍 Nearby authorized dealers

Get the best deal on your dream bike! 🎯

Need immediate assistance?
Call us at: +91-9876543210
Email us at: support@bikersalliance.in

Ride Safe,
Team BikersAlliance
https://bikersalliance.in/
      `
    };
  }

  // Fallback for unknown lead types
  return {
    subject: `🏍️ Your Request Received - ${leadData.bike_name}`,
    html: `
      <p>Hello ${leadData.name},</p>
      <p>Thank you for your interest in ${leadData.bike_name}. Our team will contact you soon.</p>
      <p>Best regards,<br>Team BikersAlliance</p>
    `,
    text: `Hello ${leadData.name}, Thank you for your interest in ${leadData.bike_name}. Our team will contact you soon. Best regards, Team BikersAlliance`
  };
}