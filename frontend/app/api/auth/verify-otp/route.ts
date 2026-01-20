import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { isValidOTP } from '@/lib/otp';

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (!isValidOTP(otp)) {
      return NextResponse.json(
        { error: 'Invalid OTP format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // Create a Supabase client
    const supabase = createClient();

    // Retrieve the OTP from database
    const { data: otpRecord, error: fetchError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      // Check if too many attempts
      const { data: allAttempts } = await supabase
        .from('email_otps')
        .select('attempts')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (allAttempts && allAttempts.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please request a new verification code.' },
          { status: 429 }
        );
      }

      // Increment attempts
      await supabase
        .from('email_otps')
        .update({ attempts: (allAttempts?.attempts || 0) + 1 })
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1);

      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please check your code and try again.' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('email_otps')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      console.error('OTP update error:', updateError);
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 500 }
      );
    }

    // Update user's email_verified status in Supabase Auth
    // Note: Without service role key, we can't directly update auth.users
    // The user is already created, they just need to sign in
    
    // Sign in the user automatically after verification
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: request.headers.get('x-temp-password') || '', // This won't work - see note below
    });

    // NOTE: We can't auto-sign-in without the password
    // The frontend should handle sign-in after successful verification
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Email verified successfully! You can now sign in.',
        verified: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during verification' },
      { status: 500 }
    );
  }
}
