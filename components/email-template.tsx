import * as React from 'react';

interface EmailTemplateProps {
  otp: string;
}

export function EmailTemplate({ otp }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#222' }}>
      <h2>LMS-Courses Verification Code</h2>
      <p>Your one-time password (OTP) is:</p>
      <div
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          letterSpacing: '0.3em',
          background: '#f4f4f4',
          padding: '1em',
          borderRadius: '8px',
          textAlign: 'center',
          margin: '1em 0',
        }}
      >
        {otp}
      </div>
      <p>Please enter this code to verify your email address. This code will expire soon.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p style={{ fontSize: '0.9em', color: '#888' }}>&mdash; The LMS-Courses Team</p>
    </div>
  );
}
