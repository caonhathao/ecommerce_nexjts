'use client';

import { Loading } from '@/components/loading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { fetchData } from '@/funcs/fetch';
import { useIsMobile } from '@/hooks/use-mobile';
import { paths } from '@/lib/path';
import { productDetail, variantDetail } from '@/types/manager.data-types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoIosArrowUp } from 'react-icons/io';
import { formatPrice } from '@/lib/utils';

interface props {
  id: string | null;
  openDetail: boolean;
  SetOpenDetail: Dispatch<SetStateAction<boolean>>;
}

const TableCellViewer = ({ id, openDetail, SetOpenDetail }: props) => {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<productDetail | null>(null);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const t = useTranslations('admin_statistic_page.product_drawer');
  const c = useTranslations('general');

  // This effect runs when 'openIndex' changes
  useEffect(() => {
    // Only run if an item was OPENED
    if (openIndex !== null) {
      // We must wait for your 300ms animation to finish
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;

        // Find the specific <li> element we want to scroll to
        const element = document.getElementById(`variant-item-${openIndex}`);

        if (container && element) {
          // This calculates the <li>'s position *inside* the scroll container
          const scrollToPosition = element.offsetTop - container.offsetTop;

          // Scroll the container to the element
          container.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth',
          });
        }
      }, 300); // 300ms matches your animation

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [openIndex]);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const response = await fetchData({
          baseUrl: paths.manager.product.fetch_detail,
          params: { id: id },
          setData: undefined,
        });
        if (response) {
          console.log(response.data);
          setDetail(response.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const renderVariant = (index: number, value: variantDetail) => {
    return (
      <div
        className={`w-full flex flex-col gap-4 
      ${openIndex === index ? 'max-h-[500px]' : 'max-h-0'}
      transition-[max-height] duration-300 ease-in-out
      overflow-hidden`}
        key={index}
      >
        <div className="w-full flex justify-center items-center">
          <Image
            src={value.image}
            alt={value.image || index.toString()}
            width={0}
            height={0}
            className="w-[50%]"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="name">{t('t_product_name')}</Label>
            <div className="w-full">{value.name}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="sku">{t('t_sku_code')}</Label>
            <div className="w-full">{value.sku}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="price">{t('t_price')}</Label>
            <div>
              {formatPrice(Number(value.price), {
                currency: c('t_currency'),
                rate: Number(c('t_rate')),
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="currency-variant">{t('t_currency')}</Label>
            <div>{value.currency}</div>
          </div>
        </div>
        <Separator />
      </div>
    );
  };

  if (!openDetail) return;

  if (!id || !detail) return <Loading />;

  return (
    <Drawer
      direction={isMobile ? 'bottom' : 'right'}
      open={openDetail}
      onOpenChange={SetOpenDetail}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{detail?.title || 'unknown'}</DrawerTitle>
          <DrawerDescription>{t('t_product_desc')}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          ref={scrollContainerRef}
        >
          <form className="flex flex-col gap-4">
            <div className="w-full flex justify-center items-center">
              <Carousel className="w-[70%] max-w-lg">
                <CarouselContent>
                  {detail?.images?.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card className="w-full h-64 overflow-hidden">
                          <CardContent className="relative w-full h-full p-0">
                            <Image
                              src={img.url}
                              alt={img.alt || `Product image ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 500px"
                              priority={index === 0}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="shop">{t('t_shop')}</Label>
              <div className="w-full flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row justify-start items-center gap-2">
                  <Avatar>
                    <AvatarImage src={detail?.shop.logoUrl} alt="shopLogo" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <p>{detail?.shop.name}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={'outline'}>
                      <BsThreeDotsVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>{t('t_watch_shop')}</DropdownMenuItem>
                    <DropdownMenuItem>{t('t_copy_action')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="title">{t('t_product_name')}</Label>
                <div className="w-full">{detail?.title}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">URL-friendly</Label>
                <div className="flex flex-col gap-3">
                  <div className="w-full">{detail?.slug}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">{t('t_origin')}</Label>
                <div>{detail?.origin}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">{t('t_currency')}</Label>
                <div>{detail?.currency}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">{t('t_min_price')}</Label>
                <div>
                  {formatPrice(Number(detail?.minPrice), {
                    currency: c('t_currency'),
                    rate: Number(c('t_rate')),
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">{t('t_max_price')}</Label>
                <div>
                  {formatPrice(Number(detail?.maxPrice), {
                    currency: c('t_currency'),
                    rate: Number(c('t_rate')),
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="type">{t('t_desc')}</Label>
              <textarea defaultValue={detail?.description || ''} />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="variants-list">{t('t_variant')}</Label>
              <div className="flex flex-col  gap-4">
                <ul className="w-full flex flex-col gap-2 ">
                  {detail?.variants.map((value: variantDetail, index) => (
                    <li
                      id={`variant-item-${index}`}
                      className="flex flex-col gap-2"
                      key={value.id || index}
                    >
                      <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-row justify-start items-center gap-2">
                          <p>
                            {index + 1}
                            {'. '}
                          </p>
                          <p>{value.name}</p>
                        </div>
                        <Button
                          variant={'outline'}
                          onClick={() =>
                            setOpenIndex(openIndex !== index ? index : null)
                          }
                          type="button"
                        >
                          <div
                            className={`${
                              openIndex !== index
                                ? `transform-[rotate(180deg)]`
                                : `transform-[rotate(0deg)]`
                            } transition ease-in-out`}
                          >
                            <IoIosArrowUp />
                          </div>
                        </Button>
                      </div>

                      {renderVariant(index, value)}

                      <Separator />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">{t('t_cancel_action')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default TableCellViewer;
