'use server';

import nodemailer from 'nodemailer';
import { renderEmailTemplate } from '@/components/email-template';
import { env } from './env';

const webName = env.NEXT_PUBLIC_WEB_NAME;

function createTransporter() {
  const host = env.EMAIL_SMTP_HOST;
  const port = env.EMAIL_SMTP_PORT ? Number(env.EMAIL_SMTP_PORT) : undefined;
  const user = env.EMAIL_SMTP_USER;
  const pass = env.EMAIL_SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration is missing');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(to: string, otp: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log('----------------------------------------------');
    console.log(`📧 MOCK EMAIL TO: ${to}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log('----------------------------------------------');
    return;
  }
  const transporter = createTransporter();
  const fromAddress = `${webName} <no-reply@localhost>`;
  const html = renderEmailTemplate(otp);

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: `${webName} - Verify your email`,
      html,
    });
  } catch (err) {
    console.error('Error sending email via SMTP:', err);
    throw new Error('Error sending email');
  }
}
