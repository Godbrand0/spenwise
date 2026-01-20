import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/email-template';
import { generateSecureOTP } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Create a Supabase client
    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('email_otps')
      .select('email, created_at')
      .eq('email', email)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An OTP was recently sent. Please wait before requesting a new one.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateSecureOTP();

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('email_otps')
      .insert({
        email,
        otp_code: otp,
      });

    if (otpError) {
      console.error('OTP storage error:', otpError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Initialize Resend with API key (done at runtime, not build time)
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send OTP via Resend with custom template
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Spenwise <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your Email - Spenwise',
      react: EmailTemplate({ otp, firstName: firstName || email.split('@')[0] }),
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json(
        { 
          error: 'Failed to send verification email. Please try again.',
          details: emailError.message 
        },
        { status: 500 }
      );
    }

    // Now create the user account in Supabase (unverified)
    // We'll verify them after OTP confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable magic link
        data: {
          firstName: firstName || email.split('@')[0],
          email_verified: false,
        },
      },
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      
      // If user already exists, that's okay - they can still verify
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { 
            success: true, 
            message: 'Verification code sent. Please check your email.',
            emailId: emailData?.id
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Signup successful! Please check your email for the verification code.',
        userId: authData.user?.id,
        emailId: emailData?.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during signup' },
      { status: 500 }
    );
  }
}
