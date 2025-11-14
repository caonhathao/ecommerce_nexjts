'use client';

import ManageProductForm from '@/app/(seller)/seller/products/_components/manage-product-form';

export default function SellerCreateProductPage() {

  const handleSubmit = (data: any) => {
    // Handle product creation logic here
    console.log('Product data submitted:', data);
  }

  const isLoading = false; // Replace with actual loading state if needed

  return (
    <ManageProductForm onSubmit={handleSubmit} isLoading={isLoading} />
  )
}