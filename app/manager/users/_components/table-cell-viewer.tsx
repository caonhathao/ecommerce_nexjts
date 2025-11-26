'use client';
import { formatDay } from '@/app/(public)/_components/global-function';
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
import { fetchData } from '@/funcs/fetch';
import { useIsMobile } from '@/hooks/use-mobile';
import { paths } from '@/lib/path';
import { userDetail, userItemData } from '@/types/manager.data-types';
import { useTranslations } from 'next-intl';
import React, { SetStateAction, useEffect, useMemo } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { MdOutlineCopyAll } from 'react-icons/md';
import { toast } from 'sonner';

export function TableCellViewer({
  item,
  setUserList,
  handleCopy,
}: {
  item: userItemData;
  setUserList: React.Dispatch<SetStateAction<userItemData[]>>;
  handleCopy: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<userDetail | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const t = useTranslations('admin_user_page.user_drawer');

  useEffect(() => {
    console.log(detail);
  }, [detail]);

  async function fetchDetail() {
    try {
      const res = await fetchData({
        baseUrl: paths.manager.user.fetch_detail,
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
      const response = await fetch(`/api/manager/user?id=${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: value }),
      });
      if (response.status === 200) {
        toast(t('t_action_noti'), {
          description: t('t_update_desc_noti'),
        });
        setUserList((prev) => prev.filter((shop) => shop.id !== item.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const defaultBanned = useMemo(() => {
    return detail && detail.banned === true ? 'true' : 'false';
  }, [detail]);

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
          onClick={fetchDetail}
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{detail?.name || 'unknown'}</DrawerTitle>
          <DrawerDescription>{t('t_user_desc')}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          ref={scrollContainerRef}
        >
          <form
            id="form-edit-user"
            className="flex flex-col gap-4"
            onSubmit={() => handleSubmit}
          >
            <div className="flex flex-col gap-3">
              <Label htmlFor="user">{t('t_user_name')}</Label>
              <div className="w-full flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row justify-start items-center gap-2">
                  <Avatar>
                    <AvatarImage src={detail?.image} alt="shopLogo" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <p>{detail?.name}</p>
                </div>
                <Button
                  variant={'outline'}
                  type="button"
                  onClick={() => handleCopy(detail?.id ?? '')}
                >
                  <MdOutlineCopyAll />
                </Button>
              </div>
            </div>

            {/* show shop owned if this user has */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="shopOwned">{t('t_shop_owned')}</Label>
              {detail?.shopsOwned && detail?.shopsOwned.length > 0 ? (
                <>
                  <div className="w-full flex flex-col gap-3">
                    {detail?.shopsOwned.map((value, index) => (
                      <div
                        key={index}
                        className="w-full flex flex-row justify-between items-center gap-2"
                      >
                        <div className="flex flex-row justify-start items-center gap-2">
                          <Avatar>
                            <AvatarImage src={value.logoUrl} alt="shopLogo" />
                            <AvatarFallback>UK</AvatarFallback>
                          </Avatar>
                          <p>{value.name}</p>
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
                                type="button"
                                variant={'ghost'}
                                onClick={() => handleCopy(value.id ?? '')}
                              >
                                {t('t_copy_action')}
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="italic">{t('t_no_shop_owned')}</p>
              )}
            </div>

            {/* show shop membership is this user has */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="shop_membership">{t('t_shop_membership')}</Label>
              {detail?.shopMemberships && detail?.shopMemberships.length > 0 ? (
                <>
                  <div className="w-full flex flex-col gap-3">
                    {detail?.shopMemberships.map((value, index) => (
                      <div
                        key={index}
                        className="w-full flex flex-row justify-between items-center gap-2"
                      >
                        <div className="flex flex-row justify-start items-center gap-2">
                          <Avatar>
                            <AvatarImage
                              src={value.shop.logoUrl}
                              alt="shopLogo"
                            />
                            <AvatarFallback>UK</AvatarFallback>
                          </Avatar>
                          <p>{value.shop.name}</p>
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
                                type="button"
                                variant={'ghost'}
                                onClick={() => handleCopy(value.shop.id ?? '')}
                              >
                                {t('t_copy_action')}
                              </Button>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="italic">{t('t_no_shop_membership')}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="emailForBill">{t('t_email_for_bill')}</Label>
              <p id="emailForBill">{detail?.profile.emailForBill}</p>
            </div>

            <div className="flex flex-row gap-3 justify-between items-center">
              <div className="flex flex-col gap-3">
                <Label htmlFor="phone">{t('t_number_phone')}</Label>
                <p id="phone">{detail?.profile.phone ?? t('t_empty')}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="gender">{t('t_gender')}</Label>
                <p id="gender">
                  {detail?.profile.gender === 'MALE'
                    ? t('c_male')
                    : detail?.profile.gender === 'FEMALE'
                      ? t('c_female')
                      : t('c_other')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="title">{t('t_email')}</Label>
                <div className="w-full">{detail?.email}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">{t('t_email_verified')}</Label>
                <div className="flex flex-row gap-3 items-center border border-gray-300 rounded-full w-fit p-0.5">
                  {detail?.emailVerified === false ? (
                    <FiXCircle className="fill-red-500 dark:fill-red-400" />
                  ) : (
                    <FaCheckCircle className="fill-green-500 dark:fill-green-400" />
                  )}
                  {detail?.emailVerified === true
                    ? t('t_verified')
                    : t('t_no_verified')}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="bannedStatus">{t('t_banned_status')}</Label>
              <Select value={defaultBanned}>
                <SelectTrigger id="bannedStatus" className="w-full">
                  <SelectValue placeholder={t('t_status_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">{t('c_no_banned')}</SelectItem>
                  <SelectItem value="true">{t('c_banned')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="banReason">{t('t_ban_reason')}</Label>
              <textarea
                id="banReason"
                defaultValue={detail?.banReasion || ''}
                disabled={true}
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="banExpired">{t('t_ban_expired')}</Label>
              <p id="banExpired">{formatDay(detail?.banExpires)}</p>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button type="submit" form="form-edit-user">
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
