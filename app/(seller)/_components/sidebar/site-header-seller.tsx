import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { env } from '@/lib/env';
import { ModeToogle } from '@/components/custom/mode-toogle';

const WEB_NAME = env.NEXT_PUBLIC_WEB_NAME;
export function SiteHeaderSeller() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{WEB_NAME}</h1>
        <div className="ml-auto flex items-center gap-2">
          <ModeToogle />
        </div>
      </div>
    </header>
  );
}
