'use client';
import React from 'react';
import { Sidebar } from '../ui/sidebar';

import { BsTicketPerforated } from 'react-icons/bs';
import { FaCcAmazonPay, FaCreditCard } from 'react-icons/fa';

import { categoryIconMap } from '@/constants/category-icon-map';
import { useCategories } from '@/hooks/use-categories';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const extensions = [
  {
    title: 'promotion',
    url: '#',
    icon: BsTicketPerforated,
  },
  {
    title: 'pay_top_up',
    url: '#',
    icon: FaCreditCard,
  },
  {
    title: 'pay_later',
    url: '#',
    icon: FaCcAmazonPay,
  },
];

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const t = useTranslations('home_layout');
  const { categories, loading, error } = useCategories();
  const topCategories = categories.filter((cat) => cat.parentId === null);

  return (
    <div className="w-[25%]">
      <div className="w-full overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-hide ">
        <div className="flex flex-col jus-end items-end">
          <div className="w-[70%] p-2 bg-background-secondary rounded-lg border border-gray-200 flex flex-col justify-start items-start">
            {/* title */}
            <p className="font-bold text-base px-5 py-1 text-primary">
              {t('category')}
            </p>

            <div className="flex flex-col justify-start items-start pl-2">
              {topCategories.map((item, key) => (
                <div
                  key={key}
                  className="w-full hover:bg-primary-foreground px-3 py-4 rounded-lg transition-all"
                >
                  <a
                    href={item.slug}
                    className="flex flex-row gap-1.5 justify-start items-center"
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={20}
                        height={20}
                        className="rounded-2xl"
                      />
                    ) : (
                      <IconComponent
                        slug={item.slug}
                        size={20}
                        color="var(--primary)"
                      />
                    )}
                    <p className="text-sm">{item.name}</p>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="w-[70%] p-2 bg-background-secondary rounded-lg border border-gray-200 flex flex-col justify-start items-start mt-4">
            {/* title */}
            <p className="font-bold text-base px-5 py-1 text-primary">
              {t('extensions')}
            </p>

            <div className="flex flex-col justify-start items-start pl-2 gap-2 w-full">
              {extensions.map((item, key) => (
                <div
                  key={key}
                  className="w-full hover:bg-primary-foreground px-3 py-4 rounded-lg transition-all"
                >
                  <a
                    href={item.url}
                    className="flex flex-row gap-1.5 justify-start items-center"
                  >
                    <item.icon size={20} color="var(--primary)" />
                    <p className="text-sm">{t(item.title)}</p>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const IconComponent = ({
  slug,
  size = 20,
  color = 'var(--primary)',
}: {
  slug: string;
  size?: number;
  color?: string;
}) => {
  const Icon = categoryIconMap[slug] || categoryIconMap['default'];
  return Icon ? <Icon size={size} color={color} /> : null;
};
