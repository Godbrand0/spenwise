# Quick Start: Custom OTP Email

## 🚀 Setup (2 minutes)

### 1. Get Resend API Key
- Sign up at [resend.com](https://resend.com)
- Create API key
- Add to `.env.local`:
```bash
RESEND_API_KEY=re_your_key_here
```

### 2. Run Migration
```bash
npx supabase db push
```

### 3. Test It!
```bash
npm run dev
# Go to /auth/signup
# Enter email & password
# Check email for OTP
# Enter code → Auto signed in! ✨
```

## 📧 What You Get

✅ Beautiful branded OTP emails via Resend  
✅ Secure 6-digit codes (10-min expiration)  
✅ Rate limiting (5 attempts max)  
✅ Auto sign-in after verification  
✅ No service role key needed  

## 📁 Files Created

- `components/email-template.tsx` - Email design
- `lib/otp.ts` - OTP utilities
- `app/api/auth/signup/route.ts` - Signup endpoint
- `app/api/auth/verify-otp/route.ts` - Verification endpoint
- `supabase/migrations/002_create_email_otps_table.sql` - Database

## 🎨 Customize

**Email Template:** Edit `components/email-template.tsx`  
**Expiration Time:** Edit migration file (default: 10 min)  
**Max Attempts:** Edit `verify-otp/route.ts` (default: 5)  
**Sender Email:** Update in `signup/route.ts`

## 📖 Full Documentation

See `README_OTP_SETUP.md` for complete guide.

## ⚠️ Before Production

- [ ] Verify domain with Resend
- [ ] Update sender email
- [ ] Test deliverability
- [ ] Disable Supabase default emails

## 🆘 Troubleshooting

**Email not sending?**
- Check `RESEND_API_KEY` in `.env.local`
- Check Resend dashboard logs

**OTP not working?**
- Check database: `SELECT * FROM email_otps;`
- Verify OTP hasn't expired (10 min)

**Migration failed?**
- Run: `npx supabase db reset && npx supabase db push`
