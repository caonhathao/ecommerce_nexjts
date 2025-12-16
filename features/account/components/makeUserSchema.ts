import { z } from 'zod';

export const makeUserProfileSchema = (msg: {
  fullNameRequired: string;
  emailInvalid: string;
  phoneInvalid: string;
}) =>
  z.object({
    fullName: z.string().min(1, msg.fullNameRequired),
    birthDate: z
      .object({ day: z.string(), month: z.string(), year: z.string() })
      .optional()
      .nullable(),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    phone: z
      .string()
      .optional()
      .nullable()
      .refine((v) => !v || v.trim().length >= 5, msg.phoneInvalid),
    emailForBill: z.email(msg.emailInvalid),
  });

export type UserProfileFormValues = z.infer<
  ReturnType<typeof makeUserProfileSchema>
>;
