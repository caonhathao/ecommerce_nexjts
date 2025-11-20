'use client';

import { LoadingComponent } from '@/app/(public)/_components/loading';
import { fetchData } from '@/funcs/fetch';
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
        await fetchData(
          '/api/reviews',
          { id: id, page: 1, limit: 5 },
          setInitialResponse
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadReviews();
  }, [id]);

  if (loading || !initialResponse) {
    return <LoadingComponent />;
  }

  return (
    <ReviewsClient
      id={id}
      ratingAvg={ratingAvg}
      ratingCount={ratingCount}
      initialResponse={initialResponse}
    />
  );
}
