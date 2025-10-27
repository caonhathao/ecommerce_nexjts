'use client';
import Header from '@/app/(public)/_components/header';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen">
      <div>
        <Header />
        <div className="m-0 p-0 w-full h-full bg-gray-200">{children}</div>
      </div>
    </div>
  );
}
