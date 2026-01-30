# Email Notification System for Bookings

This document describes the email notification system implemented for the BikersAlliance booking functionality.

## Overview

The system sends automated email notifications in the following scenarios:

1. **Booking Confirmation**: When a user successfully books a bike through the "Book Now" button
2. **Status Updates**: When the booking status changes from "pending" to "confirmed" (or any other status)

## Implementation Details

### Files Added/Modified

#### 1. `lib/email-booking.ts` (New)
- Contains email service configuration using Resend API
- Implements email template functions for booking confirmations and status updates
- Provides fallback mechanisms for development and webhook services
- Exports two main functions:
  - `sendBookingConfirmationEmail()`
  - `sendBookingStatusUpdateEmail()`

#### 2. `app/api/bookings/route.ts` (Modified)
- **POST method**: Added email notification when booking is created
- **PUT method**: Added email notification when booking status changes
- Includes user data fetching for email personalization

#### 3. `app/api/admin/bookings/[id]/route.ts` (Modified)
- **PATCH method**: Added email notification when admin updates booking status
- Specifically triggers email when status changes from "pending" to "confirmed"
- Uses admin service role to fetch user details for email

## Email Templates

### 1. Booking Confirmation Email
**Trigger**: When a new booking is created via "Book Now" button
**Subject**: `🏍️ Booking Confirmed - [Brand] [Model]`

**Content includes**:
- Personalized greeting with user name
- Complete booking details (Order ID, bike details, price, date)
- Status badge showing "PENDING"
- Next steps information
- Call-to-action button to view orders
- Contact information for support

### 2. Status Update Email
**Trigger**: When booking status changes from "pending" to "confirmed"
**Subject**: `✅ Booking Confirmed! - Order #[Order ID]`

**Content includes**:
- Status-specific messaging and emoji
- Updated booking details with new status
- Dynamic next steps based on status
- Call-to-action button to view orders
- Contact information for support

**Supported Status Types**:
- `pending`: ⏳ Booking being reviewed
- `confirmed`: ✅ Booking confirmed and processing
- `completed`: 🎉 Order completed/delivered
- `cancelled`: ❌ Booking cancelled

## Email Service Configuration

### Primary Service: Resend
The system uses Resend as the primary email service provider.

**Required Environment Variables**:
```bash
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=your-sender@yourdomain.com  # Optional, defaults to onboarding@resend.dev
```

### Fallback Options
1. **Webhook Service**: Configure `EMAIL_WEBHOOK_URL` for custom email service
2. **Development Mode**: Emails are logged to console for testing

## User Data Sources

The system fetches user information from multiple sources:

1. **For regular bookings**: Uses `supabase.auth.getUser()` for current user
2. **For admin updates**: Uses `supabase.auth.admin.getUserById()` with service role
3. **Fallback data**: Uses email address for basic personalization if full name unavailable

## Data Flow

### Booking Creation Flow
```
User clicks "Book Now" → 
Booking created in database → 
User auth data fetched → 
Email template generated → 
Email sent via Resend → 
Success response returned
```

### Status Update Flow (Admin)
```
Admin updates booking status → 
Current booking data fetched → 
Status change detected → 
User data fetched via admin client → 
Email template generated → 
Email sent via Resend → 
Update response returned
```

## Email Content Features

### Professional Design
- Responsive HTML templates
- Professional styling with brand colors
- Email-safe CSS
- Clear visual hierarchy
- Mobile-friendly layout

### Personalization
- User's full name or fallback to email username
- Complete booking details
- Dealer information (when available)
- Status-specific messaging

### Actionable Content
- Direct links to user dashboard
- Contact information for support
- Clear next steps instructions
- Professional branding

## Error Handling

### Graceful Degradation
- If email sending fails, booking operation still completes successfully
- Errors are logged but don't affect core functionality
- Multiple fallback options ensure reliability

### Logging
- Comprehensive console logging for debugging
- Email content saved in development mode
- Error details captured for troubleshooting

## Testing

### Development Testing
1. Set up environment variables (or leave empty for logging mode)
2. Create a new booking
3. Check console logs for email content
4. Update booking status from admin panel
5. Verify email content in logs

### Production Testing
1. Configure Resend API key
2. Test booking creation flow
3. Test status update flow
4. Verify emails are received
5. Test email rendering across devices

## Configuration

### Environment Setup
Add to your `.env.local` file:
```bash
# Required for production email sending
RESEND_API_KEY=re_xxxxxxxxx

# Optional - customize sender email
FROM_EMAIL=bookings@yourdomain.com

# Optional - webhook fallback
EMAIL_WEBHOOK_URL=https://your-webhook-service.com/send-email

# Required for user data access (should already exist)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain
3. Generate API key
4. Add API key to environment variables

## Monitoring and Analytics

### Email Delivery Tracking
- Resend provides delivery analytics
- Email IDs are logged for tracking
- Failed deliveries are logged for debugging

### Performance Considerations
- Emails are sent asynchronously
- Core booking functionality is not blocked by email sending
- Minimal impact on API response times

## Future Enhancements

### Possible Improvements
1. **Email Templates**: Add more sophisticated HTML templates
2. **Status Notifications**: Add emails for all status changes
3. **User Preferences**: Allow users to opt-out of certain emails
4. **Email Queue**: Implement queue system for high-volume sending
5. **A/B Testing**: Test different email templates and content
6. **Localization**: Support for multiple languages

### Additional Triggers
- Welcome emails for new registrations
- Reminder emails for pending bookings
- Follow-up emails after delivery
- Review request emails

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check RESEND_API_KEY configuration
2. **Wrong sender address**: Verify FROM_EMAIL domain is verified in Resend
3. **User data missing**: Check user authentication and database structure
4. **Template rendering**: Check HTML template syntax and CSS compatibility

### Debug Steps
1. Check console logs for email service errors
2. Verify environment variables are loaded
3. Test with development mode (no API key) first
4. Use Resend dashboard to track delivery status
5. Check spam folders for test emails

## Security Considerations

### Data Privacy
- Only necessary user data is included in emails
- Email content is not stored permanently
- User email addresses are protected

### API Security
- Resend API key is kept secure in environment variables
- Service role key usage is limited to necessary operations
- Email sending does not expose sensitive booking data

---

## Summary

The email notification system provides a professional and reliable way to keep users informed about their booking status. It integrates seamlessly with the existing booking system while providing multiple fallback options and comprehensive error handling.