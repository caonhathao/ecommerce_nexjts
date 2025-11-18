'use client';

import { useEffect, useState, useCallback } from 'react';

export type CategoryNode = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  imageUrl: string | null;
  position: number;
  isActive?: boolean;
  children?: CategoryNode[];
};

type UseCategoriesReturn = {
  categories: CategoryNode[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/category', { next: { revalidate: 60 } });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data as CategoryNode[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { categories, loading, error, refetch: load };
}
