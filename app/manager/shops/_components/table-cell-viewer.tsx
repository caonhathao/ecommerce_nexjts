'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { formatDay } from '@/lib/utils';
import {
  shopDetail,
  shopItemData,
  shopMember,
} from '@/types/manager.data-types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { SetStateAction, useMemo } from 'react';
import { MdOutlineCopyAll } from 'react-icons/md';
import { toast } from 'sonner';

export function TableCellViewer({
  item,
  setShopList,
  handleCopy,
}: {
  item: shopItemData;
  setShopList: React.Dispatch<SetStateAction<shopItemData[]>>;
  handleCopy: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<shopDetail | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [value, setValue] = React.useState<string>('');
  const t = useTranslations('admin_shop_page.shop_drawer');

  // useEffect(() => {
  //   console.log(detail);
  // }, [detail]);

  async function fetchDetail() {
    try {
      const res = await fetchData({
        baseUrl: paths.manager.shop.fetch_detail,
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
        url: paths.manager.shop.update,
        body: {
          id: detail?.id || '',
          status: value,
        },
        contentType: 'application/json',
      });
      if (response.status === 200) {
        toast(t('t_action_noti'), {
          description: t('t_update_desc_noti'),
        });
        setShopList((prev) => prev.filter((shop) => shop.id !== item.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const defaultStatus = useMemo(() => {
    return detail?.status || '';
  }, [detail]);

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left hover:cursor-pointer"
          onClick={() => fetchDetail()}
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{detail?.name || 'unknown'}</DrawerTitle>
          <DrawerDescription>{t('t_shop_desc')}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          ref={scrollContainerRef}
        >
          <form className="flex flex-col gap-4">
            <div className="w-full flex justify-center items-center mb-3">
              {/* show cover image */}
              <div className="w-full relative">
                {detail ? (
                  <Image
                    src={detail.coverUrl}
                    alt="shop cover image"
                    width={1200}
                    height={600}
                    className="w-full"
                  />
                ) : null}
                <div className="absolute left-5 -bottom-5">
                  <Image
                    src={detail ? detail?.logoUrl : ''}
                    alt="shop cover image"
                    width={0}
                    height={0}
                    className="w-10 rounded-full border border-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="shop">{t('t_shop')}</Label>
              <div className="w-full flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row justify-start items-center gap-2">
                  <Avatar>
                    <AvatarImage src={detail?.logoUrl} alt="shopLogo" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <p>{detail?.name}</p>
                </div>
                <Button
                  variant={'outline'}
                  type="button"
                  onClick={() => handleCopy(detail?.owner.id ?? '')}
                  className="hover:cursor-pointer"
                >
                  {t('t_copy_action')}
                  <MdOutlineCopyAll />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="shop">{t('t_owner_name')}</Label>
              <div className="w-full flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row justify-start items-center gap-2">
                  <Avatar>
                    <AvatarImage src={detail?.owner.image} alt="ownerLogo" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <p>{detail?.owner.name}</p>
                </div>
                <Button
                  variant={'outline'}
                  type="button"
                  onClick={() => handleCopy(detail?.owner.id ?? '')}
                  className="hover:cursor-pointer"
                >
                  <MdOutlineCopyAll />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="title">{t('t_created_at')}</Label>
                <div className="w-full">{formatDay(detail?.createdAt)}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">{t('t_updated_at')}</Label>
                <div className="flex flex-col gap-3">
                  <div className="w-full">{formatDay(detail?.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">{t('t_rating')}</Label>
                <div>{detail?.ratingAvg}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">{t('t_rating_count')}</Label>
                <div>{detail?.ratingCount}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">{t('t_email')}</Label>
                <div>{detail?.contactEmail}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">{t('t_number_phone')}</Label>
                <div>{detail?.contactPhone}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="visibility">{t('t_status')}</Label>
              <Select
                defaultValue={defaultStatus}
                onValueChange={(value) => setValue(value)}
              >
                <SelectTrigger
                  id="visibility"
                  className="w-full hover:cursor-pointer"
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="hover:cursor-pointer">
                    {t('c_active')}
                  </SelectItem>
                  <SelectItem value="PENDING" className="hover:cursor-pointer">
                    {t('c_pending')}
                  </SelectItem>
                  <SelectItem
                    value="SUSPENDED"
                    className="hover:cursor-pointer"
                  >
                    {t('c_suspended')}
                  </SelectItem>
                  <SelectItem value="CLOSED" className="hover:cursor-pointer">
                    {t('c_closed')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="type">{t('t_desc')}</Label>
              <textarea defaultValue={detail?.description || ''} disabled />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="variants-list">{t('t_members')}</Label>
              <div className="flex flex-col  gap-4">
                <ul className="w-full flex flex-col gap-2 ">
                  {detail?.members.map((value: shopMember, index) => (
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
                          <Avatar>
                            <AvatarImage
                              src={value.user.image}
                              alt="shopLogo"
                            />
                            <AvatarFallback>UK</AvatarFallback>
                          </Avatar>
                          <p>{value.user.name}</p>
                          <p>{'(' + value.role + ')'}</p>
                        </div>
                        <Button
                          variant={'outline'}
                          type="button"
                          onClick={() => handleCopy(value.id)}
                          className="hover:cursor-pointer"
                        >
                          <MdOutlineCopyAll />
                        </Button>
                      </div>
                      <Separator />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button
            onClick={() => handleSubmit(value)}
            className="hover:cursor-pointer"
          >
            {t('t_submit_action')}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="hover:cursor-pointer">
              {t('t_cancel_action')}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
