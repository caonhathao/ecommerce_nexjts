'use client';

import { formatPrice } from '@/app/(public)/_components/global-function';
import { Loading } from '@/app/(public)/_components/loading';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { productDetail, variantDetail } from '@/types/manager.data-types';
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoIosArrowUp } from 'react-icons/io';

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
        const response = await fetch(`/api/manager/product/${id}`);
        const detail = await response.json();
        //console.log(detail.data);
        setDetail(detail.data);
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
            <Label htmlFor="name">Tên sản phẩm</Label>
            <div className="w-full">{value.name}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="sku">Mã SKU</Label>
            <div className="w-full">{value.sku}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="price">Giá</Label>
            <div>{formatPrice(Number(value.price))}</div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="currency-variant">Đơn vị tiền tệ</Label>
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
          <DrawerDescription>Thông tin chi tiết sản phẩm</DrawerDescription>
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
              <Label htmlFor="shop">Cửa hàng</Label>
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
                    <DropdownMenuItem>Xem cửa hàng</DropdownMenuItem>
                    <DropdownMenuItem>Sao chép ID</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="title">Tên sản phẩm</Label>
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
                <Label htmlFor="target">Xuất xứ</Label>
                <div>{detail?.origin}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Đơn vị tiền tệ</Label>
                <div>{detail?.currency}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Giá tối thiểu</Label>
                <div>{formatPrice(Number(detail?.minPrice))}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Giá tối đa</Label>
                <div>{formatPrice(Number(detail?.maxPrice))}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="type">Mô tả</Label>
              <textarea defaultValue={detail?.description || ''} />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="variants-list">Phiên bản</Label>
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
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default TableCellViewer;
