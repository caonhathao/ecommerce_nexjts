'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { Icon } from '@tabler/icons-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function NavMainSeller({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | Icon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  const handleLoginTransaction = async () => {
    try {
      const res = await fetch('/api/stripe/create-login-link', {
        method: 'POST',
      });

      const data = await res.json();

      if (data.url) {
        // Mở trong tab mới để user không bị thoát khỏi app của bạn
        window.open(data.url, '_blank');
      } else {
        toast.error(data.error || 'Không thể truy cập ví tiền');
      }
    } catch (error) {
      toast.error('Lỗi kết nối' + error);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const childMatch = item.items?.some((sub) =>
            Boolean(sub.url && pathname.startsWith(sub.url))
          );
          const isOpen = Boolean(
            item.isActive || childMatch || (item.url && pathname === item.url)
          );

          return item.items && item.items.length > 0 ? (
            // Item with submenu
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.title}
                        className={cn(
                          subItem.url &&
                            pathname === subItem.url &&
                            'bg-accent/50'
                        )}
                      >
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            // Item without submenu
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a
                  href={item.url}
                  onClick={(e) => {
                    if (item.title === 'Transaction') {
                      e.preventDefault();
                      handleLoginTransaction();
                    }
                  }}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
