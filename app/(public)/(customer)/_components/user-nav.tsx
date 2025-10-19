'use client';

import { usePathname } from 'next/navigation';


import {
  User2,
  Bell,
  Package,
  RefreshCcw,
  MapPin,
  CreditCard,
  Star,
  Eye,
  Heart,
  MessageSquareText,
  Crown,
  Gift,
  Landmark,
  TicketPercent,
  Sparkles,
  Coins,
  BookOpenCheck,
  LifeBuoy,
  Badge,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Messages {
  membership: string;
  help: string;
  profile: string;
  notifications: string;
  orders: string;
  returns: string;
  addresses: string;
  payments: string;
  reviews: string;
  recently_viewed: string;
  wishlist: string;
  comments: string;
  vip: string;
  referrals: string;
  bnpl: string;
  vouchers: string;
  astra: string;
  coins: string;
  bookcare: string;
  support: string;
  member_badge: string;
}

type Item = {
  href: string;
  i18nKey: keyof Messages;
  Icon: React.ComponentType<any>;
  rightEl?: React.ReactNode;
};
type Section = { headingKey?: keyof Messages; items: Item[] };

type UserMini = { name: string; email?: string; avatar_url?: string };

export default function UserNav({ user }: { user: UserMini }) {
  const pathname = usePathname();
  const t = useTranslations('user_navbar');

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const SECTIONS: Section[] = [
    {
      items: [
        { href: '/customer/account/edit', i18nKey: 'profile', Icon: User2 },
        {
          href: '/customer/account/notifications',
          i18nKey: 'notifications',
          Icon: Bell,
        },
        { href: '/customer/account/orders', i18nKey: 'orders', Icon: Package },
        {
          href: '/customer/account/returns',
          i18nKey: 'returns',
          Icon: RefreshCcw,
        },
        {
          href: '/customer/account/addresses',
          i18nKey: 'addresses',
          Icon: MapPin,
        },
        {
          href: '/customer/account/payments',
          i18nKey: 'payments',
          Icon: CreditCard,
        },
        { href: '/customer/account/reviews', i18nKey: 'reviews', Icon: Star },
        {
          href: '/customer/account/recently-viewed',
          i18nKey: 'recently_viewed',
          Icon: Eye,
        },
        {
          href: '/customer/account/wishlist',
          i18nKey: 'wishlist',
          Icon: Heart,
        },
        {
          href: '/customer/account/comments',
          i18nKey: 'comments',
          Icon: MessageSquareText,
        },
      ],
    },
    {
      headingKey: 'membership',
      items: [
        {
          href: '/customer/account/vip',
          i18nKey: 'vip',
          Icon: Crown,
          rightEl: (
            <Badge className="text-[10px] px-1.5 py-0">
              {t('member_badge')}
            </Badge>
          ),
        },
        {
          href: '/customer/account/referrals',
          i18nKey: 'referrals',
          Icon: Gift,
        },
        { href: '/customer/account/bnpl', i18nKey: 'bnpl', Icon: Landmark },
        {
          href: '/customer/account/vouchers',
          i18nKey: 'vouchers',
          Icon: TicketPercent,
        },
        { href: '/customer/account/astra', i18nKey: 'astra', Icon: Sparkles },
        { href: '/customer/account/tikixu', i18nKey: 'coins', Icon: Coins },
        {
          href: '/customer/account/bookcare',
          i18nKey: 'bookcare',
          Icon: BookOpenCheck,
        },
      ],
    },
    {
      headingKey: 'help',
      items: [{ href: '/support', i18nKey: 'support', Icon: LifeBuoy }],
    },
  ];

  return (
    <div className="rounded-lg border bg-card">
    {/*  User header (name, email, avatar)*/}
      <div className="flex items-center gap-3 p-4">
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
      </div>
      <Separator />

    {/*  Section */}
      <nav className="p-2">
        {SECTIONS.map((section, idx) => (
          <div key={idx} className={cn(idx > 0 && "mt-2")}>
            {section.headingKey ? (
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                {t(section.headingKey)}
              </div>
            ) : null}

            <ul className="space-y-1">
              {section.items.map(({ href, i18nKey, Icon, rightEl }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm",
                        active ? "bg-muted font-medium" : "hover:bg-muted/60"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{t(i18nKey)}</span>
                      </span>
                      {rightEl}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {idx < SECTIONS.length - 1 ? <Separator className="my-2" /> : null}
          </div>
        ))}
      </nav>
    </div>
  )
}


function initials(name: string) {
  const path = name.trim().split("")
  const first = path[0]?.[0] ?? ""
  const last = path.length > 1 ? path[path.length - 1]?.[0] ?? "" : ""
  return (first + last).toUpperCase()
}
