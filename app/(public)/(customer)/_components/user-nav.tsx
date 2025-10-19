'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

import {
  User2, Bell, Package, RefreshCcw, MapPin, CreditCard, Star,
  Eye, Heart, MessageSquareText, Crown, Gift, Landmark, TicketPercent,
  Sparkles, Coins, BookOpenCheck, LifeBuoy
} from 'lucide-react';

type Messages =
  | 'membership' | 'help'
  | 'profile' | 'notifications' | 'orders' | 'returns' | 'addresses' | 'payments'
  | 'reviews' | 'recently_viewed' | 'wishlist' | 'comments'
  | 'vip' | 'referrals' | 'bnpl' | 'vouchers' | 'astra' | 'coins' | 'bookcare'
  | 'support' | 'member_badge';

type Item = {
  href: string;
  i18nKey: Messages;
  Icon: React.ComponentType<any>;
  rightEl?: React.ReactNode;
  disabled?: boolean;
};
type Section = { headingKey?: Messages; items: Item[] };

type UserMini = { name: string; email?: string; avatar_url?: string };

export default function UserNav({ user }: { user: UserMini }) {
  const pathname = usePathname();
  const t = useTranslations('user_navbar');
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const SECTIONS: Section[] = [
    {
      items: [
        { href: '/customer/account/edit', i18nKey: 'profile', Icon: User2 },
        { href: '/customer/account/notifications', i18nKey: 'notifications', Icon: Bell },
        { href: '/customer/account/orders', i18nKey: 'orders', Icon: Package },
        { href: '/customer/account/returns', i18nKey: 'returns', Icon: RefreshCcw },
        { href: '/customer/account/addresses', i18nKey: 'addresses', Icon: MapPin },
        { href: '/customer/account/payments', i18nKey: 'payments', Icon: CreditCard },
        { href: '/customer/account/reviews', i18nKey: 'reviews', Icon: Star },
        { href: '/customer/account/recently-viewed', i18nKey: 'recently_viewed', Icon: Eye },
        { href: '/customer/account/wishlist', i18nKey: 'wishlist', Icon: Heart },
        { href: '/customer/account/comments', i18nKey: 'comments', Icon: MessageSquareText }
      ]
    },
    {
      headingKey: 'membership',
      items: [
        {
          href: '/customer/account/vip',
          i18nKey: 'vip',
          Icon: Crown,
          rightEl: <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{t('member_badge')}</Badge>
        },
        { href: '/customer/account/referrals', i18nKey: 'referrals', Icon: Gift },
        { href: '/customer/account/bnpl', i18nKey: 'bnpl', Icon: Landmark },
        { href: '/customer/account/vouchers', i18nKey: 'vouchers', Icon: TicketPercent },
        { href: '/customer/account/astra', i18nKey: 'astra', Icon: Sparkles },
        { href: '/customer/account/tikixu', i18nKey: 'coins', Icon: Coins },
        { href: '/customer/account/bookcare', i18nKey: 'bookcare', Icon: BookOpenCheck }
      ]
    },
    {
      headingKey: 'help',
      items: [{ href: '/support', i18nKey: 'support', Icon: LifeBuoy }]
    }
  ];

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        {/* Header */}
        <CardHeader className="flex-row items-center gap-3 space-y-0 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user.name}</div>
            {user.email ? (
              <div className="truncate text-xs text-muted-foreground">{user.email}</div>
            ) : null}
          </div>
        </CardHeader>

        <Separator />

        {/* Body */}
        <CardContent className="p-0">
          <ScrollArea className="h-full max-h-[70vh]">
            <div className="p-2">
              {/* Section 1 (no heading, flat list) */}
              <div className="space-y-1">
                {SECTIONS[0].items.map((it) => (
                  <NavItem key={it.href} {...it} active={isActive(it.href)} label={t(it.i18nKey)} />
                ))}
              </div>

              <Separator className="my-2" />

              {/* Section 2 - Membership */}
              <Accordion type="single" collapsible defaultValue="membership" className="w-full">
                <AccordionItem value="membership" className="border-b-0">
                  <AccordionTrigger className="px-2 text-left text-xs font-semibold text-muted-foreground hover:no-underline">
                    {t(SECTIONS[1].headingKey!)}
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pt-1">
                    <div className="space-y-1">
                      {SECTIONS[1].items.map((it) => (
                        <NavItem key={it.href} {...it} active={isActive(it.href)} label={t(it.i18nKey)} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator className="my-2" />

              {/* Section 3 - Support */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="support" className="border-b-0">
                  <AccordionTrigger className="px-2 text-left text-xs font-semibold text-muted-foreground hover:no-underline">
                    {t(SECTIONS[2].headingKey!)}
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pt-1">
                    <div className="space-y-1">
                      {SECTIONS[2].items.map((it) => (
                        <NavItem key={it.href} {...it} active={isActive(it.href)} label={t(it.i18nKey)} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function NavItem({
                   href,
                   label,
                   Icon,
                   rightEl,
                   active,
                   disabled
                 }: Item & { label: string; active?: boolean }) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Button
          asChild
          disabled={disabled}
          variant={active ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-between px-3 py-2 text-sm',
            'hover:bg-muted/60',
            active && 'font-medium'
          )}
        >
          <Link href={href} aria-current={active ? 'page' : undefined} className="flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </span>
            {rightEl}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}
