'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ManageProductFormInput } from './productSchema';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function ProductTagsStep() {
  const form = useFormContext<ManageProductFormInput>();
  const [query, setQuery] = React.useState('');

  const normalize = (s: string) => s.trim().toLowerCase();
  const currentKeywords: string[] = form.getValues('keywords') ?? [];

  const addKeyword = (kw: string) => {
    const name = kw.trim();
    if (!name) return;
    const exists = currentKeywords.some(
      (c) => normalize(c) === normalize(name)
    );
    if (exists) return;
    form.setValue('keywords', [...currentKeywords, name], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeKeyword = (index: number) => {
    const cur = [...(form.getValues('keywords') ?? [])];
    cur.splice(index, 1);
    form.setValue('keywords', cur, { shouldDirty: true, shouldValidate: true });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!query.trim()) return;
      addKeyword(query);
      setQuery('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Tags / Keywords</h3>
      </div>

      <FormField
        control={form.control}
        name="keywords"
        render={() => (
          <FormItem>
            <FormLabel>Product Keywords</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type a keyword and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      addKeyword(query);
                      setQuery('');
                    }}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {currentKeywords.map((k, idx) => (
                    <div
                      key={`${k}-${idx}`}
                      className="inline-flex items-center gap-2 bg-muted/30 px-2 py-1 rounded"
                    >
                      <span className="text-sm">{k}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(idx)}
                        className="p-0.5"
                        aria-label="Remove keyword"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
