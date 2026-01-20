import { NextRequest, NextResponse } from 'next/server';
import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    // Initialize Resend with API key (done at runtime, not build time)
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { email, otp, firstName } = await request.json();

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Spenwise <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your Email - Spenwise',
      react: EmailTemplate({ otp, firstName }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
