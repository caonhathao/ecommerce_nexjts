import { useEffect, useState } from 'react';

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
    fetch('/api/seller/shops')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch shops');
        return res.json();
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
