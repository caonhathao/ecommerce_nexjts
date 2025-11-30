'use client';

import { Loading } from '@/components/loading';
import { fetchData } from '@/funcs/fetch';
import { paths } from '@/lib/path';
import { reviewResponse } from '@/types/public.data-types';
import { useEffect, useState } from 'react'; // Import hooks
import { ReviewsClient } from './reviews-client';

interface props {
  ratingAvg: number;
  ratingCount: number;
  id: string;
}

// 2. Remove 'async' keyword
export function Reviews({ id, ratingAvg, ratingCount }: props) {
  const [initialResponse, setInitialResponse] = useState<reviewResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // 3. Fetch data inside useEffect instead of 'await'
  useEffect(() => {
    const loadReviews = async () => {
      try {
        await fetchData({
          baseUrl: paths.reviews.fetch_all,
          params: { id: id, page: 1, limit: 5 },
          setData: setInitialResponse,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadReviews();
  }, [id]);

  if (loading || !initialResponse) {
    return <Loading />;
  }

  return (
    <ReviewsClient
      ratingAvg={ratingAvg}
      ratingCount={ratingCount}
      initialResponse={initialResponse}
    />
  );
}
