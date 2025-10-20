'use client';
import { AppSidebar } from '@/components/custom/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import Header from '@/app/(public)/_components/header';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen">
      <div>
        <Header />
        <div className="m-0 p-0 w-full h-screen bg-gray-200">{children}</div>
      </div>
    </div>
  );
}
