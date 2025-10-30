import { AppSidebar } from '@/components/custom/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import HeaderServer from '@/app/(public)/_components/header-server';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen">
      <div>
        <HeaderServer />
        <div className="m-0 p-0 w-full h-ful bg-gray-200">{children}</div>
      </div>
    </div>
  );
}
