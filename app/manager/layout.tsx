import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen">
      <div>
        <div className="m-0 p-0 w-full h-ful bg-gray-200">{children}</div>
      </div>
    </div>
  );
}