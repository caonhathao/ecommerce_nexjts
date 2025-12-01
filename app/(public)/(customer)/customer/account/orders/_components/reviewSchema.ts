import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Vui lòng chọn số sao'),
  title: z.string().optional(),
  body: z.string().optional(),
  images: z.array(z.any()).optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
