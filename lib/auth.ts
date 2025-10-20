import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import {env} from "./env";
import {admin, emailOTP} from "better-auth/plugins";
import {EmailTemplate} from "@/components/email-template";
import {resend} from "@/lib/resend";
import {prisma} from "@/lib/db";
import {NextRequest, NextResponse} from "next/server";
import {headers} from "next/headers";

const webName = env.NEXT_PUBLIC_WEB_NAME;
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        github: {
            clientId: env.AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.AUTH_GITHUB_SECRET,
        },
    },

    plugins: [
        emailOTP({
            async sendVerificationOTP({email, otp}) {
                const {data, error} = await resend.emails.send({
                    from: webName + " <onboarding@resend.dev>",
                    to: [email],
                    subject: webName + " - Verify your email",
                    react: EmailTemplate({otp: otp}),
                });

                if (error) {
                    console.error(error);
                    throw new Error("Error sending email");
                }

            },
        }),
        admin(),
    ],
});

export const checkAuth = async () => {


    if (!userId) {
        return {
            error: NextResponse.json(
                {error: 'Unauthorized', code: 'UNAUTHORIZED'},
                {status: 401}
            ),
        };
    }

    return {userId: userId};
}
