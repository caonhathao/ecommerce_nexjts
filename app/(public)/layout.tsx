import HeaderServer from '@/app/(public)/_components/header-server';
import { ReactNode } from 'react';
import { Footer } from '@/app/(public)/_components/footer';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen">
      <div>
        <HeaderServer />
        <div className="m-0 p-0 w-full h-full bg-background">{children}</div>
        <Footer />
      </div>
    </div>
  );
}
