'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';
import { ManageProductFormInput } from '../_components/productSchema';
import ManageProductForm from '@/app/(seller)/seller/products/_components/manage-product-form';

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ManageProductFormInput) => {
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
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
      <ManageProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
