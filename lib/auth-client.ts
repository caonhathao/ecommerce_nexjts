import { createAuthClient } from 'better-auth/react';
import { adminClient, emailOTPClient } from 'better-auth/client/plugins';
// import { nextCookies } from 'better-auth/next-js';

export const authClient = createAuthClient({
  plugins: [emailOTPClient(), adminClient()],
});
