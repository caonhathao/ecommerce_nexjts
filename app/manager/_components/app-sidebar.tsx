'use client';

import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

import { Loading } from '@/app/(public)/_components/loading';
import { useTranslations } from 'next-intl';
import { AiOutlineProduct } from 'react-icons/ai';
import { BsGraphUpArrow } from 'react-icons/bs';
import { CiBoxList, CiShop } from 'react-icons/ci';
import { GoPeople } from 'react-icons/go';

interface user {
  image: string;
  name: string;
  email: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [dataUser, setDataUser] = React.useState<user | null>(null);
  const t = useTranslations('admin_layout.admin_app_sidebar');

  const data = {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: '2T3H Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
      },
      {
        name: 'Evil Corp.',
        logo: Command,
        plan: 'Free',
      },
    ],
    navMain: [
      {
        title: t('t_dashboard'),
        url: '#',
        icon: SquareTerminal,
        items: [
          {
            title: t('t_dashboard'),
            url: '/manager/dashboard',
          },
        ],
      },
      {
        title: t('t_category'),
        url: '#',
        icon: CiBoxList,
        items: [
          {
            title: t('t_category_management'),
            url: '/manager/categories',
          },
        ],
      },
      {
        title: t('t_product'),
        url: '#',
        icon: AiOutlineProduct,
        items: [
          {
            title: t('t_product_management'),
            url: '/manager/products',
          },
          {
            title: t('t_complaint'),
            url: '#',
          },
        ],
      },
      {
        title: t('t_shop'),
        url: '#',
        icon: CiShop,
        items: [
          {
            title: t('t_shop_management'),
            url: '/manager/shops',
          },
          {
            title: t('t_support'),
            url: '#',
          },
          {
            title: t('t_complaint'),
            url: '#',
          },
        ],
      },
      {
        title: t('t_user'),
        url: '#',
        icon: GoPeople,
        items: [
          {
            title: t('t_user_management'),
            url: '#',
          },
          {
            title: t('t_support'),
            url: '#',
          },
          {
            title: t('t_complaint'),
            url: '#',
          },
        ],
      },
      {
        title: t('t_statistic'),
        url: '#',
        icon: BsGraphUpArrow,
        items: [
          {
            title: t('t_revenue'),
            url: '/manager/statistic/revenue',
          },
          {
            title: t('t_traffic'),
            url: '#',
          },
          {
            title: t('t_user'),
            url: '#',
          },
          {
            title: t('t_shop'),
            url: '#',
          },
        ],
      },
      {
        title: t('t_settings'),
        url: '#',
        icon: Settings2,
        items: [
          {
            title: t('t_general'),
            url: '#',
          },
          {
            title: t('t_feedback'),
            url: '#',
          },
          {
            title: t('t_payment'),
            url: '#',
          },
        ],
      },
    ],
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/manager`);
        const data = await response.json();
        setDataUser(data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  if (!dataUser) return <Loading />;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dataUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
