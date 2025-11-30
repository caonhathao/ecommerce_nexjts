import { z } from 'zod';
import { ShopMemberRole } from '@/lib/generated/prisma';

export const InviteMemberSchema = z.object({
  email: z.email(),
  role: z.enum(ShopMemberRole).optional(),
  shopId: z.uuid(),
});

export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
