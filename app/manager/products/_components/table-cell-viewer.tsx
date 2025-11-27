'use client';
import { formatPrice } from '@/app/(public)/_components/global-function';
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
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { fetchData } from '@/funcs/fetch';
import { putData } from '@/funcs/put';
import { useIsMobile } from '@/hooks/use-mobile';
import { paths } from '@/lib/path';
import {
  productDetail,
  productItemData,
  variantDetail,
} from '@/types/manager.data-types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useEffect } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoIosArrowUp } from 'react-icons/io';
import { toast } from 'sonner';

export function TableCellViewer({
  item,
  setProductList,
  handleCopy,
}: {
  item: productItemData;
  setProductList: React.Dispatch<React.SetStateAction<productItemData[]>>;
  handleCopy: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<productDetail | null>(null);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const t = useTranslations('admin_product_page.product_drawer');
  const [open, setOpen] = React.useState<boolean>(false);

  const [value, setValue] = React.useState<string>('');

  //console.log('product detail: ', item);

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

  const defaultVisibility: string = detail?.visibility ?? '';

  async function fetchDetail() {
    try {
      const res = await fetchData({
        baseUrl: paths.manager.product.fetch_detail,
        params: { id: item.id },
        setData: undefined,
        cacheType: 'default',
      });

      if (res) {
        setDetail(res.data);
      }
    } catch (err) {
      console.error(err);
      toast(t('t_process_failed_noti'), {
        description: t('t_conn_failed_desc_noti'),
      });
    }
  }

  const handleSubmit = async (value: string) => {
    try {
      const response = await putData({
        url: paths.manager.product.update,
        body: {
          id: detail?.id || '',
          visibility: value,
        },
        contentType: 'application/json',
      });
      if (response.status === 200) {
        toast(t('t_action_noti'), {
          description: t('t_update_desc_noti'),
        });
        setProductList((prev) =>
          prev.filter((product) => product.id !== item.id)
        );
      }
    } catch (e) {
      toast(t('t_action_noti'), {
        description: t('t_update_failed_desc_noti'),
      });
      console.error(e);
    }
  };

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
            sizes="50vw"
            className="w-[50%] h-auto" // h-auto is REQUIRED to keep the aspect ratio
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
            <div>{formatPrice(Number(value.price))}</div>
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

  return (
    <Drawer
      direction={isMobile ? 'bottom' : 'right'}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
          onClick={() => {
            fetchDetail();
          }}
        >
          {item.title}
        </Button>
      </DrawerTrigger>
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
                    <AvatarImage src={item.shop.logoUrl} alt="shopLogo" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <p>{item.shop.name}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={'outline'}>
                      <BsThreeDotsVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Button
                        variant={'ghost'}
                        onClick={() => handleCopy(detail?.id ?? '')}
                      >
                        {t('t_copy_action')}
                      </Button>
                    </DropdownMenuItem>
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
                <div>{formatPrice(Number(detail?.minPrice))}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">{t('t_max_price')}</Label>
                <div>{formatPrice(Number(detail?.maxPrice))}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="visibility">{t('t_visibility')}</Label>
              <Select
                defaultValue={defaultVisibility}
                onValueChange={(value) => setValue(value)}
              >
                <SelectTrigger id="visibility" className="w-full">
                  <SelectValue placeholder={t('t_visibility_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNLISTED">{t('c_unlisted')}</SelectItem>
                  <SelectItem value="PRIVATE">{t('c_private')}</SelectItem>
                  <SelectItem value="PUBLIC">{t('c_public')}</SelectItem>
                </SelectContent>
              </Select>
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
                      key={index}
                      id={`variant-item-${index}`}
                      className="flex flex-col gap-2"
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
          <Button onClick={() => handleSubmit(value)}>
            {t('t_submit_action')}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">{t('t_cancel_action')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
