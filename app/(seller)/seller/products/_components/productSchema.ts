import { z } from 'zod';
import { ProductStatus, Visibility, Currency } from '@/lib/generated/prisma';

const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

// Product Image Schema
export const productImageSchema = z.object({
  id: z.uuid().optional(),
  url: z.url('Invalid image URL'),
  publicId: z.string().min(1, 'Public ID is required'),
  alt: z.string().optional().nullable(),
  position: z.number().int().min(0).default(0),
});

// Product Variant Schema
export const productVariantSchema = z.object({
  id: z.uuid().optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  name: z.string().min(1, 'Name is required').max(255),
  price: z.coerce.number().positive('Price must be greater than 0'),
  image: z.url('Invalid variant image URL'),
  imagePublicId: z.string().min(1, 'Public ID is required'),
  compareAt: z.number().positive().optional().nullable(),
  currency: z.enum(Currency).default(Currency.VND),
  stock: z.number().int().min(0, 'Stock cannot be negative').default(0),
  reserved: z.number().int().min(0).default(0),
  weightGrams: z.number().int().positive().optional().nullable(),
  lengthMm: z.number().int().positive().optional().nullable(),
  widthMm: z.number().int().positive().optional().nullable(),
  heightMm: z.number().int().positive().optional().nullable(),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
  isActive: z.boolean().default(true),
});

// Product Tag Schema
// export const productTagSchema = z
//   .object({
//     tagId: z
//       .preprocess(emptyToUndefined, z.string().uuid('Invalid UUID'))
//       .optional(),
//     name: z
//       .preprocess(
//         emptyToUndefined,
//         z.string().min(1, 'Tag name is required').max(50)
//       )
//       .optional(),
//   })
//   .refine((d) => !!d.tagId || !!d.name, {
//     message: 'Provide a tag id or a tag name',
//     path: ['tagId'],
//   });

// Base Product Schema
const baseProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(500)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  origin: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(ProductStatus).default(ProductStatus.DRAFT),
  visibility: z.enum(Visibility).default(Visibility.PUBLIC),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
  categoryId: z.uuid('Category is required'),
  currency: z.enum(Currency).default(Currency.VND),
});

export const manageProductSchema = baseProductSchema
  .extend({
    id: z.uuid().optional(),
    shopId: z.uuid('Invalid shop ID').optional(),
    images: z
      .array(productImageSchema)
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed')
      .optional(),
    variants: z
      .array(productVariantSchema)
      .min(1, 'At least one variant is required')
      .max(50, 'Maximum 50 variants allowed')
      .optional(),
    keywords: z
      .array(z.string().min(1, 'Keyword is required').max(100))
      .max(50, 'Maximum 50 keywords allowed')
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (data.variants) {
        const skus = data.variants.map((v) => v.sku);
        return new Set(skus).size === skus.length;
      }
      return true;
    },
    {
      message: 'All variant SKUs must be unique',
      path: ['variants'],
    }
  );

export type ManageProductFormInput = z.infer<typeof manageProductSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
