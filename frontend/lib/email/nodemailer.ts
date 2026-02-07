import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { EmailTemplate } from '@/components/email-template';
import React from 'react';

// Create a transporter using Gmail service
// Note: This uses App Passwords for authentication
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  otp: string;
  firstName: string;
}

/**
 * Sends an OTP verification email using Nodemailer and Gmail
 */
export async function sendOTPEmail({ to, subject, otp, firstName }: SendEmailOptions) {
  try {
    // Render the React email template to HTML
    const emailHtml = await render(
      React.createElement(EmailTemplate, {
        otp,
        firstName,
      })
    );

    const mailOptions = {
      from: `"Spenwise" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export default transporter;
