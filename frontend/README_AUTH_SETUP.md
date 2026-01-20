# Supabase SMTP Setup Guide (Resend)

To ensure reliable email delivery for OTPs and verification links, follow these steps to connect Resend to your Supabase project.

## 1. Get Resend API Key
1. Sign up/Login at [Resend](https://resend.com).
2. Go to **API Keys** and create a new key with "Full Access".
3. Copy the key (starts with `re_`).

## 2. Configure Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **Settings** -> **Auth** -> **Email Settings**.
3. Enable **External SMTP**.
4. Fill in the following details:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `465`
   - **SMTP User**: `resend`
   - **SMTP Pass**: `[Your Resend API Key]`
   - **Sender Email**: `onboarding@resend.dev` (or your verified domain)
   - **Sender Name**: `Spenwise`
5. Click **Save**.

## 3. Enable Email Confirmations
1. In the same **Auth** settings, go to **Providers** -> **Email**.
2. Ensure **Enable Email provider** is ON.
3. Ensure **Confirm email** is ON.
4. (Optional) Enable **Secure email change** for better security.

## 4. Test the Flow
Try signing up with a real email address in the Spenwise app. You should receive a verification email via Resend within seconds.
