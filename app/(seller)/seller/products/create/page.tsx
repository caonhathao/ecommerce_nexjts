'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ManageProductFormInput } from '../_components/productSchema';
import ManageProductForm from '@/app/(seller)/seller/products/_components/manage-product-form';
import { Button } from '@/components/ui/button';

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasShop, setHasShop] = useState<boolean | null>(null);
  const [checkingShops, setCheckingShops] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/seller/shops');
        const data = await res.json().catch(() => ({}));
        // endpoint returns an array of shops on success
        const shopsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        if (mounted) setHasShop((shopsArray?.length || 0) > 0);
      } catch {
        if (mounted) setHasShop(false);
      } finally {
        if (mounted) setCheckingShops(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (data: ManageProductFormInput) => {
    if (hasShop === false) {
      toast.error('Create a shop before creating products.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Product created successfully!');
        router.push('/seller/products');
      } else {
        toast.error(result.error || 'Failed to create product');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

      {checkingShops ? null : hasShop === false ? (
        <div className="mb-6 p-4 rounded border bg-yellow-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <strong className="block">You don’t have a shop yet.</strong>
            <p className="text-sm text-muted-foreground">
              Create a shop first to start creating products.
            </p>
          </div>
          <div>
            <Button onClick={() => router.push('/seller/shops/create')}>
              Create shop
            </Button>
          </div>
        </div>
      ) : null}

      <ManageProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
