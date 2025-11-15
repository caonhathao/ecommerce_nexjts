// ProductTagsStep.tsx
'use client';

import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import type { ManageProductFormInput } from './productSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

export default function ProductTagsStep() {
  const { control, register } = useFormContext<ManageProductFormInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags',
  });

  const [newTagText, setNewTagText] = useState('');

  const handleAddFreeTag = () => {
    const trimmed = newTagText.trim();
    if (!trimmed) return;
    append({ name: trimmed });
    setNewTagText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Product Tags</h3>
        <p className="text-sm text-muted-foreground">
          Add keywords that help your customers find this product.
        </p>
      </div>

      <FormItem>
        <FormLabel>Current tags</FormLabel>
        <FormControl>
          <div className="flex flex-wrap gap-2">
            {fields.length === 0 ? (
              <span className="text-sm text-muted-foreground">No tags added yet</span>
            ) : (
              fields.map((f, idx) => (
                <div key={f.id} className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md text-sm">
                  <span>{(f as any).name ?? (f as any).tagId}</span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </FormControl>
        <FormDescription>These tags will be saved with your product.</FormDescription>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Add new tag</FormLabel>
        <div className="flex gap-2">
          <FormControl className="flex-1">
            <Input
              value={newTagText}
              onChange={(e) => setNewTagText(e.target.value)}
              placeholder="Enter tag name (e.g. 'summer', 'blue', 'premium')"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFreeTag();
                }
              }}
            />
          </FormControl>
          <Button type="button" onClick={handleAddFreeTag}>Add</Button>
        </div>
        <FormMessage />
      </FormItem>

      {/* Hidden inputs for RHF to track both fields */}
      <div className="hidden">
        {fields.map((f, idx) => (
          <div key={f.id}>
            <input {...register(`tags.${idx}.tagId` as const)} defaultValue={(f as any).tagId} />
            <input {...register(`tags.${idx}.name` as const)} defaultValue={(f as any).name} />
          </div>
        ))}
      </div>
    </div>
  );
}
