import { ReactNode } from 'react';
import HeaderServer from '@/app/(public)/_components/header-server';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="">
      <div>
        <HeaderServer />
        <div className="">{children}</div>
      </div>
    </div>
  );
}
