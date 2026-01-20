# Custom OTP Email Setup Guide (No Service Role Key Required)

This guide explains how to set up the custom OTP (One-Time Password) email verification system using Resend for Spenwise.

## Overview

The custom OTP system uses:
- **Custom OTP generation and storage** in a Supabase database table
- **Resend** for sending branded, professional emails
- **Supabase Auth** for user account management
- **No service role key required** - works with standard Supabase client

## Architecture

```
User Signs Up
    ↓
POST /api/auth/signup
    ↓
1. Generate secure 6-digit OTP
2. Store OTP in email_otps table
3. Send branded email via Resend
4. Create user in Supabase Auth
    ↓
User receives beautiful email with OTP
    ↓
User enters OTP in verification form
    ↓
POST /api/auth/verify-otp
    ↓
1. Verify OTP from database
2. Mark as verified
3. Auto sign-in user
    ↓
User is logged in and redirected
```

## Setup Steps

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Copy your API key (starts with `re_`)

### 2. Configure Environment Variables

Add this to your `.env.local` file:

```bash
# Resend API Key (for sending emails)
RESEND_API_KEY=re_your_resend_api_key_here

# These should already exist
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**That's it!** No service role key needed.

### 3. Run Database Migration

The OTP table migration has already been created. Run it:

```bash
cd frontend
npx supabase db push
```

This creates the `email_otps` table with:
- OTP storage
- Expiration tracking (10 minutes)
- Attempt limiting
- Auto-cleanup of expired OTPs

### 4. Configure Resend Domain (Optional but Recommended)

For production, verify your own domain with Resend:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Follow the DNS configuration steps
4. Update the `from` field in `/app/api/auth/signup/route.ts`:

```typescript
from: 'Spenwise <noreply@yourdomain.com>',
```

### 5. Disable Supabase Default Emails (Recommended)

To prevent duplicate emails:

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Go to **Settings** tab
3. Under **Email Auth**, toggle off "Enable email confirmations"

This ensures only your custom Resend emails are sent.

## Files Created

### Database

- **`supabase/migrations/002_create_email_otps_table.sql`** - OTP storage table

### Backend API Routes

- **`app/api/auth/signup/route.ts`** - Custom signup with OTP generation and email sending
- **`app/api/auth/verify-otp/route.ts`** - OTP verification with auto sign-in
- **`app/api/send/route.ts`** - Generic email sending endpoint (for future use)

### Frontend Components

- **`components/email-template.tsx`** - Branded OTP email template
- **`components/auth/SignupForm.tsx`** - Updated to use custom flow

### Utilities

- **`lib/otp.ts`** - OTP generation and validation utilities

## How It Works

### 1. User Signs Up

```typescript
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John"
}
```

**Backend Process:**
1. Validates email and password
2. Generates secure 6-digit OTP
3. Stores OTP in `email_otps` table (expires in 10 min)
4. Sends beautiful email via Resend
5. Creates user account in Supabase Auth

### 2. User Receives Email

The email includes:
- ✨ Spenwise branding
- 🔢 Large, easy-to-read OTP code
- ⏰ Expiration notice (10 minutes)
- 🔒 Security instructions
- 💎 Professional, modern design

### 3. User Verifies OTP

```typescript
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Backend Process:**
1. Looks up OTP in database
2. Checks expiration and attempts
3. Marks OTP as verified
4. Returns success

**Frontend Process:**
1. Automatically signs in user with password
2. Redirects to home page

## Database Schema

### email_otps Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User's email address |
| otp_code | TEXT | 6-digit OTP |
| created_at | TIMESTAMP | When OTP was created |
| expires_at | TIMESTAMP | When OTP expires (created_at + 10 min) |
| verified | BOOLEAN | Whether OTP has been used |
| attempts | INTEGER | Number of verification attempts |

**Features:**
- Auto-expires after 10 minutes
- Rate limiting (max 5 attempts)
- Auto-cleanup of expired OTPs
- Prevents OTP reuse

## Testing

### 1. Test the Complete Flow

```bash
# Start dev server
npm run dev

# Navigate to signup page
# http://localhost:3000/auth/signup

# Enter email and password
# Check your email for OTP
# Enter the 6-digit code
# You should be auto-signed in and redirected
```

### 2. Test Email Sending Directly

```bash
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "otp": "123456",
    "firstName": "Test"
  }'
```

### 3. Check Database

```sql
-- View all OTPs
SELECT * FROM email_otps ORDER BY created_at DESC;

-- View unexpired OTPs
SELECT * FROM email_otps 
WHERE expires_at > NOW() 
ORDER BY created_at DESC;

-- Clean up test data
DELETE FROM email_otps WHERE email = 'test@example.com';
```

## Security Features

### ✅ Built-in Protection

1. **OTP Expiration** - 10 minutes (configurable)
2. **Rate Limiting** - Max 5 verification attempts per OTP
3. **One-time Use** - OTPs can't be reused
4. **Auto-cleanup** - Expired OTPs are automatically deleted
5. **Secure Generation** - Cryptographically secure random numbers
6. **No Service Role Key** - Uses standard auth, no elevated privileges

### 🔒 Best Practices

- OTPs are stored in database, not in code
- Email validation before sending
- Attempt limiting prevents brute force
- Automatic expiration prevents replay attacks

## Troubleshooting

### Email Not Sending

**Check Resend API Key:**
```bash
cat .env.local | grep RESEND_API_KEY
```

**Check Resend Dashboard:**
- Go to resend.com → Logs
- Look for failed email attempts

### OTP Verification Failing

**Common Issues:**
1. **Expired OTP** - Request a new one
2. **Too many attempts** - Request a new OTP
3. **Wrong email** - Email must match exactly

**Check Database:**
```sql
SELECT * FROM email_otps 
WHERE email = 'user@example.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

### Migration Issues

**If migration fails:**
```bash
# Check migration status
npx supabase db diff

# Reset and try again
npx supabase db reset
npx supabase db push
```

## Customization

### Change OTP Expiration

Edit `supabase/migrations/002_create_email_otps_table.sql`:

```sql
expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'), -- Change to 15 min
```

Then run:
```bash
npx supabase db reset
npx supabase db push
```

### Change Max Attempts

Edit `app/api/auth/verify-otp/route.ts`:

```typescript
const MAX_ATTEMPTS = 10; // Change from 5 to 10
```

### Customize Email Template

Edit `components/email-template.tsx` to change:
- Colors and styling
- Logo and branding
- Text content
- Layout

### Add First Name Input Field

Update `components/auth/SignupForm.tsx`:

```typescript
const [firstName, setFirstName] = useState('');

// Add input field
<input
  type="text"
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
  placeholder="First Name"
/>

// Use in signup
body: JSON.stringify({
  email,
  password,
  firstName, // Real first name instead of email split
}),
```

## Production Checklist

Before deploying:

- [ ] Verify custom domain with Resend
- [ ] Update sender email to your domain
- [ ] Test email deliverability (Gmail, Outlook, etc.)
- [ ] Ensure `.env.local` variables are in production
- [ ] Set up monitoring for email delivery
- [ ] Configure proper error logging
- [ ] Test on mobile devices
- [ ] Review email spam score
- [ ] Add analytics tracking
- [ ] Set up alerts for failed emails

## API Reference

### POST /api/auth/signup

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John" // optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Signup successful! Please check your email for the verification code.",
  "userId": "uuid",
  "emailId": "resend-email-id"
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message"
}
```

### POST /api/auth/verify-otp

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now sign in.",
  "verified": true
}
```

**Error Response (400/429/500):**
```json
{
  "error": "Error message"
}
```

### POST /api/send

Generic email sending endpoint.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "firstName": "John"
}
```

## Support & Resources

- **Resend Docs**: https://resend.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **React Email**: https://react.email (for advanced email templates)

## What's Different from Supabase Default?

| Feature | Supabase Default | Custom OTP Flow |
|---------|-----------------|-----------------|
| Email Template | Basic, generic | Fully branded, custom |
| Email Provider | Supabase | Resend (better deliverability) |
| OTP Storage | Internal | Custom database table |
| Customization | Limited | Complete control |
| Service Role Key | Required (old approach) | Not required ✅ |
| Rate Limiting | Basic | Custom (5 attempts) |
| Expiration | Configurable | 10 min (customizable) |

## Summary

You now have a complete, production-ready custom OTP email verification system that:

✅ Sends beautiful, branded emails via Resend  
✅ Stores OTPs securely in your database  
✅ Includes rate limiting and expiration  
✅ Auto-signs in users after verification  
✅ Requires NO service role key  
✅ Is fully customizable  

Happy coding! 🚀
