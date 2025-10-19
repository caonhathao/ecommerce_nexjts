import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/app/(public)/_components/Header';
import { AppSidebar } from '@/components/custom/app-sidebar';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return(

        <SidebarProvider className={"flex flex-col"}>
          <div className={"flex flex-1 relative gap-2 mt-5 p-2"}>
            <div className="flex flex-row justify-center items-start w-[90%] h-full gap-6 relative">
              <AppSidebar />
              <div className="w-[75%]">
                {children}
              </div>
            </div>
          </div>
        </SidebarProvider>
  )
}