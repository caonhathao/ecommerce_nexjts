import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { env } from './env';
import { admin, emailOTP } from 'better-auth/plugins';
import { EmailTemplate } from '@/components/email-template';
import { resend } from '@/lib/resend';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';
import { nextCookies } from 'better-auth/next-js';

const webName = env.NEXT_PUBLIC_WEB_NAME;
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  socialProviders: {
    github: {
      clientId: env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.$transaction(async (tx) => {
            await prisma.$transaction(async (tx) => {
              await tx.userProfile.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id, emailForBill: user.email ?? null },
              });
              await tx.cart.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id },
              });
              await tx.wishlist.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id },
              });
            });
          });
        },
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        const { data, error } = await resend.emails.send({
          from: webName + ' <onboarding@resend.dev>',
          to: [email],
          subject: webName + ' - Verify your email',
          react: EmailTemplate({ otp: otp }),
        });

        if (error) {
          console.error(error);
          throw new Error('Error sending email');
        }
      },
    }),
    admin(),
    nextCookies(),
  ],
});

export async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session ?? null;
}

export async function getCurrentUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user?.id ?? null;
}
