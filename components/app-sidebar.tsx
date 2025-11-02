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
import { AiOutlineProduct } from 'react-icons/ai';
import { CiShop } from 'react-icons/ci';
import { MdOutlineAttachMoney } from 'react-icons/md';

// This is sample data.
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
      title: 'Tổng quan',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title:'Tổng quan',
          url:'/manager/dashboard'
        }
      ],
    },
    {
      title: 'Sản phẩm',
      url: '#',
      icon: AiOutlineProduct,
      items: [
        {
          title: 'Duyệt sản phẩm',
          url: '#',
        },
        {
          title: 'Quản lí sản phẩm',
          url: '#',
        },
        {
          title: 'Khiếu nại',
          url: '#',
        },
      ],
    },
    {
      title: 'Cửa hàng',
      url: '#',
      icon: CiShop,
      items: [
        {
          title: 'Duyệt cửa hàng',
          url: '#',
        },
        {
          title: 'Quản lí cửa hàng',
          url: '#',
        },
        {
          title: 'Hỗ trợ',
          url: '#',
        },
        {
          title: 'Khiếu nại',
          url: '#',
        },
      ],
    },
    {
      title: 'Doanh thu',
      url: '#',
      icon: MdOutlineAttachMoney,
      items: [],
    },
    {
      title: 'Cài đặt',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'Chung',
          url: '#',
        },
        {
          title: 'Phản hồi',
          url: '#',
        },
        {
          title: 'Thanh toán',
          url: '#',
        },
      ],
    },
  ],
};

interface user {
  image: string;
  name: string;
  email: string;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [dataUser, setDataUser] = React.useState<user | null>(null);

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
