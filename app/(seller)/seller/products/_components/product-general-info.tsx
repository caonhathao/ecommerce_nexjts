'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ManageProductFormInput } from './productSchema';
import { useCategories } from '@/hooks/use-categories';
import { CategoryCascader } from './category-cascader';
import { useState } from 'react';
import { generateClientSlug } from '@/lib/slug-helper';
import { IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export function ProductGeneralInfo() {
  const form = useFormContext<ManageProductFormInput>();
  const { categories, loading } = useCategories();
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const handleGenerateSlug = () => {
    const title = form.getValues('title');
    if (title) {
      const slug = generateClientSlug(title);
      form.setValue('slug', slug);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">General Information</h3>
      </div>

      {/* Product Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Name Of Product <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Type product name"
                maxLength={255}
              />
            </FormControl>
            <div className="flex justify-between text-xs text-muted-foreground">
              <p>
                Refer to SEO-friendly product naming methods — attract more
                customers.
              </p>
              <span>{field.value?.length || 0} / 255</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Product Slug */}
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              URL Friendly (Slug) <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Input
                  {...field}
                  placeholder="url-friendly-product-name"
                  maxLength={255}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsEditingSlug(true);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGenerateSlug}
                  title="Generate Slug"
                >
                  <IconRefresh className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
            <FormDescription>
              URL slug is used in the product link for better SEO.z
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category Cascader */}
      <FormField
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Category <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <CategoryCascader
                categories={categories}
                value={field.value || null}
                onChange={field.onChange}
                disabled={loading}
                placeholder="Select Category"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
