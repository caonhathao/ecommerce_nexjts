"use client";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";
import Header from "../_components/Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-screen">
      <div className="[--header-height:calc(--spacing(14))]">
        <SidebarProvider className={"flex flex-col"}>
          <Header />
          <div className={"flex flex-1 relative gap-2 mt-5 p-2"}>
            <div className="flex flex-row justify-center items-start w-[90%] h-full gap-6 relative">
              <AppSidebar />
              <div className="w-[75%]">
                {children}
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
