import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/email/nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, firstName } = await request.json();

    // Validate required fields
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const { success, error, data } = await sendOTPEmail({
      to: email,
      subject: 'Verify Your Email - Spenwise',
      otp,
      firstName,
    });

    if (!success) {
      console.error('Nodemailer error:', error);
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
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
