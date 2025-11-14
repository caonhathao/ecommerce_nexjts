'use client'; // <-- Add this at the very top

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation'; // <-- Import the hook
import { ModeToogle } from './custom/mode-toogle';

/**
 * A helper function to map pathnames to titles.
 * You can customize this logic as much as you need.
 */
function getTitleFromPath(path: string): string {
  // 1. Create a map for your specific routes
  const titleMap: Record<string, string> = {
    '/manager/categories':'Quản lí danh mục',
    '/manager/product': 'Quản lí sản phẩm',
    '/manager/users': 'Quản lí người dùng',
    '/manager/shops': 'Quản lí cửa hàng',
    '/manager/statistic/revenue': 'Doanh thu',
    'manager/dashboard': 'Tổng quan',
    '/manager/settings': 'Cài đặt',
  };

  // 2. Check if the exact path is in the map
  if (titleMap[path]) {
    return titleMap[path];
  }

  // 3. Fallback logic: Try to find a dynamic match
  // For example, if the path is "/manager/product/123", we still want "Products"
  // We sort keys by length (longest first) to match "/manager/product" before "/manager"
  const matchingKey = Object.keys(titleMap)
    .sort((a, b) => b.length - a.length)
    .find((key) => path.startsWith(key));

  if (matchingKey) {
    return titleMap[matchingKey];
  }

  // 4. Generic fallback: Capitalize the last part of the URL
  const lastSegment = path.split('/').filter(Boolean).pop();
  if (lastSegment) {
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  }

  // 5. Default title if no other match is found
  return 'Documents';
}

export function SiteHeader() {
  const pathname = usePathname(); // <-- Get the current path
  const title = getTitleFromPath(pathname); // <-- Get the dynamic title

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {/* Use the dynamic title variable here */}
        <div className="w-full flex flex-row justify-between items-center">
          <h1 className="text-base font-medium">{title}</h1>
          <ModeToogle />
        </div>
      </div>
    </header>
  );
}
