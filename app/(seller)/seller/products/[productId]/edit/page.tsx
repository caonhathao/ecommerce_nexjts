'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import ManageProductForm from '@/app/(seller)/seller/products/_components/manage-product-form';
import { ManageProductFormInput } from '@/app/(seller)/seller/products/_components/productSchema';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.productId as string;
  const [product, setProduct] = useState<ManageProductFormInput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setIsLoading(true);
    fetch(`/api/seller/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.data);
      })
      .catch(() => {
        toast.error('Failed to fetch product');
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  const handleSubmit = async (data: ManageProductFormInput) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Product updated successfully!');
        router.push('/seller/products');
      } else {
        toast.error(result.error || 'Failed to update product');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {product ? (
        <ManageProductForm
          product={product}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
