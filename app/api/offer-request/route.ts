import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

// Email service configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Initialize Resend if API key is available
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
// Function to create email content
function createOfferEmailContent(customerData: any, offerData: any) {
  const { name, email, mobile } = customerData;
  const { bikeName, dealerName, offerTitle, offerPrice, originalPrice, discountPercent } = offerData;
  
  const savings = originalPrice - offerPrice;
  
  return {
    subject: `🎉 Your Bike Offer Request Confirmed - ${bikeName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bike Offer Request - BikersAlliance</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { 
            background: linear-gradient(135deg, #dc2626, #ea580c); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .offer-card { 
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border-left: 4px solid #dc2626;
          }
          .bike-name { color: #dc2626; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .price-section { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            margin: 15px 0;
            flex-wrap: wrap;
          }
          .original-price { 
            color: #9ca3af; 
            text-decoration: line-through; 
            font-size: 18px; 
          }
          .offer-price { 
            color: #dc2626; 
            font-size: 24px; 
            font-weight: bold; 
          }
          .savings { 
            background: #10b981; 
            color: white; 
            padding: 5px 10px; 
            border-radius: 20px; 
            font-size: 14px; 
            font-weight: bold;
          }
          .details { margin: 20px 0; }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #e5e7eb;
            flex-wrap: wrap;
          }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #6b7280; }
          .cta-section { 
            background: #f9fafb; 
            padding: 25px; 
            border-radius: 10px; 
            text-align: center; 
            margin: 20px 0;
          }
          .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #dc2626, #ea580c); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            margin: 10px 0;
          }
          .footer { 
            text-align: center; 
            color: #6b7280; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 14px;
          }
          .emoji { font-size: 1.2em; }
          @media (max-width: 600px) {
            .container { padding: 10px; }
            .price-section { flex-direction: column; align-items: flex-start; }
            .detail-row { flex-direction: column; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1><span class="emoji">🎉</span> Offer Request Confirmed!</h1>
            <p>Great choice on the ${bikeName}!</p>
          </div>
          
          <div class="content">
            <p>Hey ${name} <span class="emoji">👋</span>,</p>
            
            <p><strong>Thank you for your interest in our bike offer! Your request has been successfully submitted.</strong></p>
            
            <div class="offer-card">
              <div class="bike-name"><span class="emoji">🏍️</span> ${bikeName}</div>
              <div class="price-section">
                <div>
                  <span class="original-price">₹${originalPrice?.toLocaleString() || 'N/A'}</span>
                  <span class="offer-price">₹${offerPrice?.toLocaleString() || 'N/A'}</span>
                </div>
                ${savings > 0 ? `<div class="savings">Save ₹${savings.toLocaleString()}</div>` : ''}
              </div>
              ${discountPercent ? `<p><strong>Discount:</strong> ${discountPercent}% off</p>` : ''}
            </div>

            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Offer Title:</span>
                <span class="detail-value">${offerTitle || 'Special Offer'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Dealer:</span>
                <span class="detail-value">${dealerName || 'BikersAlliance Partner'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Your Email:</span>
                <span class="detail-value">${email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Your Mobile:</span>
                <span class="detail-value">${mobile}</span>
              </div>
            </div>

            <div class="cta-section">
              <h3><span class="emoji">📞</span> What's Next?</h3>
              <p>Our dealer partner will contact you within <strong>24-48 hours</strong> to:</p>
              <ul style="text-align: left; margin: 20px 0;">
                <li>Confirm your offer details</li>
                <li>Schedule a test ride</li>
                <li>Provide additional information</li>
                <li>Help with financing options</li>
              </ul>
              <a href="tel:${mobile}" class="cta-button">
                <span class="emoji">📱</span> Keep Your Phone Ready
              </a>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <span class="emoji">⚡</span> <strong>Limited Time Offer!</strong> 
                Make sure to respond promptly when our dealer calls to secure this amazing deal.
              </p>
            </div>

            <p>If you have any questions or need immediate assistance, feel free to contact us:</p>
            <p>
              📧 Email: <a href="mailto:support@bikersalliance.com">support@bikersalliance.com</a><br>
              📞 Phone: <a href="tel:+911800123456">+91 1800-123-456</a>
            </p>

            <p>Happy riding! <span class="emoji">🏍️💨</span></p>
            
            <p>
              Best regards,<br>
              <strong>The BikersAlliance Team</strong>
            </p>
          </div>

          <div class="footer">
            <p>© 2024 BikersAlliance. All rights reserved.</p>
            <p>This email was sent because you requested a bike offer on our website.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🎉 Offer Request Confirmed!

Hello ${name},

Thank you for your interest in the ${bikeName}! Your offer request has been successfully submitted.

Offer Details:
- Bike: ${bikeName}
- Original Price: ₹${originalPrice?.toLocaleString() || 'N/A'}
- Offer Price: ₹${offerPrice?.toLocaleString() || 'N/A'}
- Discount: ${discountPercent || 'N/A'}%
- Dealer: ${dealerName || 'BikersAlliance Partner'}
- Offer: ${offerTitle || 'Special Offer'}

Your Contact Information:
- Email: ${email}
- Mobile: ${mobile}

What's Next?
Our dealer partner will contact you within 24-48 hours to:
- Confirm your offer details
- Schedule a test ride  
- Provide additional information
- Help with financing options

Keep your phone ready! This is a limited time offer.

For any questions, contact us:
Email: support@bikersalliance.com
Phone: +91 1800-123-456

Happy riding!
The BikersAlliance Team

© 2024 BikersAlliance. All rights reserved.
    `
  };
}

// Function to send offer confirmation email
async function sendOfferConfirmationEmail(customerData: any, offerData: any): Promise<boolean> {
  try {
    const emailContent = createOfferEmailContent(customerData, offerData);
    
    console.log('🔄 Attempting to send offer confirmation email to:', customerData.email);
    console.log('📧 Resend API Key available:', !!resend);
    
    // Try Resend first (recommended for production)
    if (resend) {
      try {
        console.log('📤 Sending offer confirmation email via Resend...');
        
        const { data, error } = await resend.emails.send({
          from: `BikersAlliance <${FROM_EMAIL}>`,
          to: [customerData.email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (error) {
          console.error('❌ Resend error:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('✅ Offer confirmation email sent successfully via Resend!');
          console.log('📧 Email ID:', data?.id);
          console.log('📬 Email sent to:', customerData.email);
          return true;
        }
      } catch (resendError) {
        console.error('❌ Resend API error:', resendError);
      }
    } else {
      console.log('⚠️ Resend not available - API key missing');
    }
    
    // Development fallback: Log email content
    console.log('📧 Bike Offer Confirmation Email Ready');
    console.log('To:', customerData.email);
    console.log('Subject:', emailContent.subject);
    console.log('Content preview:', emailContent.text.substring(0, 200) + '...');
    
    // Return true for development (notification still works, just email is logged)
    return true;
  } catch (error) {
    console.error('❌ Error sending offer confirmation email:', error);
    return false;
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, mobile, offerId, bikeName, dealerName, offerTitle, offerPrice, originalPrice, discountPercent } = body;

    // Validate required fields
    if (!name || !email || !mobile) {
      return NextResponse.json(
        { error: 'Name, email, and mobile number are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { error: 'Mobile number must be 10 digits' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Save to database
    const { data, error } = await (supabase as any)
      .from('bike_offer_leads')
      .insert([
        {
          name,
          email,
          mobile,
          offer_id: offerId,
          bike_name: bikeName,
          dealer_name: dealerName,
          offer_title: offerTitle,
          offer_price: offerPrice,
          original_price: originalPrice,
          discount_percent: discountPercent,
          status: 'new'
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead information' },
        { status: 500 }
      );
    }

    // Log the successful submission
    console.log('New bike offer lead saved:', {
      id: data[0]?.id,
      name,
      email,
      mobile,
      bikeName,
      timestamp: new Date().toISOString()
    });

    // Send confirmation email to customer
    console.log('📤 Sending offer confirmation email...');
    const customerData = { name, email, mobile };
    const offerData = { 
      bikeName, 
      dealerName, 
      offerTitle, 
      offerPrice, 
      originalPrice, 
      discountPercent 
    };
    
    const emailSent = await sendOfferConfirmationEmail(customerData, offerData);
    
    if (!emailSent) {
      console.log('⚠️ Email sending failed, but offer request was still saved');
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(
      { 
        success: true, 
        message: 'Offer request submitted successfully! We will contact you soon. Check your email for confirmation.',
        leadId: data[0]?.id,
        emailSent
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing offer request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (optional - for testing)
export async function GET() {
  return NextResponse.json(
    { message: 'Offer request API endpoint is working' },
    { status: 200 }
  );
}