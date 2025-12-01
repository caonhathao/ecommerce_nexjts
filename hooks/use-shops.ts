import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/client-fetch';

export type Shop = {
  id: string;
  name: string;
  slug: string;
};

export function useShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApi('/api/seller/shops')
      .then((res) => {
        if (!res.success) throw new Error('Failed to fetch shops');
        return res.data as Shop[];
      })
      .then((data) => {
        setShops(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load shops');
        setLoading(false);
      });
  }, []);

  return { shops, loading, error };
}
