import { z } from 'zod';

export const createAddressSchema = z.object({
  line1: z.string(),
  ward: z.string(),
  district: z.string(),
  city: z.string(),
  country: z.string(),
});