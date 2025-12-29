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
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { paths } from '@/lib/path';
import { formatDay } from '@/lib/utils';
import {
  userDetail,
  userItemData,
  warehouseData,
  warehouseDetail,
} from '@/types/manager.data-types';
import { useTranslations } from 'next-intl';
import React, { SetStateAction, useEffect, useMemo } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { MdOutlineCopyAll } from 'react-icons/md';
import { toast } from 'sonner';
import { WarehouseDTO } from '../warehouse.dto';

export function TableCellViewer({
  item,
  setIsReset,
}: {
  item: warehouseData;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<warehouseDetail | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState<boolean>(false);
  const t = useTranslations('admin_user_page.user_drawer');
  const handleCopy = useCopyToClipboard({ t: t });

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
        setDetail(res.data.data);
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
        setTimeout(() => {
          setOpen(false);
          setIsReset((prev) => !prev);
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    }
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
          className="text-foreground w-fit px-0 text-left hover:cursor-pointer"
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
          ></form>
        </div>
        <DrawerFooter>
          <Button
            type="submit"
            form="form-edit-user"
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
