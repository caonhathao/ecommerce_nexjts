// app/seller/shops/new/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import CreateShopForm from '@/app/(seller)/seller/shops/_components/create-shop-form';

export const metadata = {
  title: 'Create Shop',
};

export default async function NewShopPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">Create a Shop</h1>

      <CreateShopForm />
    </div>
  );
}
