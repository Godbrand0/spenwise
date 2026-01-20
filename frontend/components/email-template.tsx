import * as React from 'react';

interface EmailTemplateProps {
  otp: string;
  firstName?: string;
}

export function EmailTemplate({ otp, firstName }: EmailTemplateProps) {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 20px',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            color: '#1f2937',
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 8px 0'
          }}>
            Spenwise
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0'
          }}>
            Smart Financial Management
          </p>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            color: '#1f2937',
            fontSize: '20px',
            fontWeight: '600',
            margin: '0 0 8px 0'
          }}>
            {firstName ? `Hello ${firstName},` : 'Hello,'}
          </h2>
          <p style={{
            color: '#4b5563',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            Thank you for signing up with Spenwise! To verify your email address, please use the One-Time Password (OTP) below:
          </p>
        </div>

        {/* OTP Box */}
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          margin: '32px 0'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 12px 0'
          }}>
            Your Verification Code
          </p>
          <div style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            display: 'inline-block'
          }}>
            <span style={{
              color: '#1f2937',
              fontSize: '32px',
              fontWeight: '700',
              letterSpacing: '8px',
              fontFamily: 'monospace'
            }}>
              {otp}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div style={{
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '4px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{
            color: '#1e40af',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            <strong>Important:</strong> This code will expire in 10 minutes. Please do not share this code with anyone.
          </p>
        </div>

        {/* Additional Info */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '24px',
          marginTop: '32px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#9ca3af',
            fontSize: '12px',
            lineHeight: '1.6',
            margin: '0'
          }}>
            This is an automated message from Spenwise. Please do not reply to this email.
          </p>
          <p style={{
            color: '#9ca3af',
            fontSize: '12px',
            margin: '8px 0 0 0'
          }}>
            © {new Date().getFullYear()} Spenwise. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
