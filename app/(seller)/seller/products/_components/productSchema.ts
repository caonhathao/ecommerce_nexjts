import { z } from 'zod';
import { ProductStatus, Visibility, Currency } from '@/lib/generated/prisma';

// Product Image Schema
export const productImageSchema = z.object({
  id: z.uuid().optional(),
  url: z.url('Invalid image URL'),
  alt: z.string().optional().nullable(),
  position: z.number().int().min(0).default(0),
});

// Product Variant Schema
export const productVariantSchema = z.object({
  id: z.uuid().optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  name: z.string().max(255).optional().nullable(),
  price: z.number().positive('Price must be greater than 0'),
  image: z.url('Invalid variant image URL'),
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
export const productTagSchema = z.object({
  tagId: z.string().uuid(),
});

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
  categoryId: z.uuid().optional().nullable(),
  currency: z.enum(Currency).default(Currency.VND),
});

// Manage Product Schema (for both create and edit forms)
export const manageProductSchema = baseProductSchema
  .extend({
    id: z.uuid().optional(), // Optional for create, required for update
    shopId: z.uuid('Invalid shop ID').optional(), // Optional for edit
    images: z
      .array(productImageSchema)
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed')
      .optional(), // Optional for edit
    variants: z
      .array(productVariantSchema)
      .min(1, 'At least one variant is required')
      .max(50, 'Maximum 50 variants allowed')
      .optional(), // Optional for edit
    tags: z
      .array(productTagSchema)
      .max(20, 'Maximum 20 tags allowed')
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

// Type export for manage product form
export type ManageProductFormInput = z.infer<typeof manageProductSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
