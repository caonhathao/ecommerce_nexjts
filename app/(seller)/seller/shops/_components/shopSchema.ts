import { z } from 'zod';

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createShopSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(slugRegex, 'Invalid slug format (lowercase letters, numbers and hyphens only)'),
  description: z.string().nullable().optional(),
  logoUrl: z.url().nullable().optional(),
  logoPublicId: z.string().nullable().optional(),
  coverUrl: z.url().nullable().optional(),
  coverPublicId: z.string().nullable().optional(),
  contactEmail: z.email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
});

export type CreateShopInput = z.infer<typeof createShopSchema>;
