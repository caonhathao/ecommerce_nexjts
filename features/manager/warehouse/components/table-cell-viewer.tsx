'use client';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchData } from '@/funcs/fetch';
import { putData } from '@/funcs/put';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { paths } from '@/lib/path';
import { formatDay } from '@/lib/utils';
import { warehouseData, warehouseDetail } from '@/types/manager.data-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import React, { SetStateAction, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaCheckCircle } from 'react-icons/fa';
import { FiXCircle } from 'react-icons/fi';
import { MdOutlineCopyAll } from 'react-icons/md';
import { toast } from 'sonner';
import z from 'zod';

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
  const t = useTranslations('admin_warehouse_page.warehouse_drawer');
  const n = useTranslations('admin_notification');
  const s = useTranslations('admin_warehouse_page.warehouse_schema');
  const handleCopy = useCopyToClipboard({ t: t });

  const formSchema = z
    .object({
      id: z.string(),
      name: z.string().min(1, {
        message: s('t_name_schema'),
      }),
      street: z.string().min(1, { message: s('t_street_schema') }),
      ward: z.string().min(1, { message: s('t_ward_schema') }),
      district: z.string().min(1, {
        message: s('t_district_schema'),
      }),
      city: z.string().min(1, {
        message: s('t_city_schema'),
      }),
      // Sử dụng coerce để tự động chuyển string từ input sang number
      size: z.number().min(1, {
        message: s('t_size_schema'),
      }),
      totalStorageArea: z.number().min(1, {
        message: s('t_storage_size_schema'),
      }),
      totalSlot: z.number().min(1, {
        message: s('t_slot_size_schema'),
      }),
      region: z.string().min(1, {
        message: s('t_region_schema'),
      }),
      status: z.string().min(1, {
        message: s('t_status_schema'),
      }),
      // Định nghĩa mảng storageArea theo interface
      storageArea: z.array(
        z.object({
          name: z.string().min(1),
          type: z.string().min(1),
          status: z.string().min(1),
        })
      ),
    })
    .refine((data) => data.totalSlot < data.totalStorageArea, {
      message: s('t_slot_size_error_message'),
      path: ['totalSlot'], // Hiển thị lỗi tại ô nhập slotSize
    });
  type FormSchemaType = z.infer<typeof formSchema>;
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      street: '',
      ward: '',
      district: '',
      city: '',
      region: '',
      totalStorageArea: 1,
      totalSlot: 1,
      status: '',
      size: 1,
      storageArea: [],
    },
  });

  async function fetchDetail() {
    try {
      const res = await fetchData({
        baseUrl: paths.manager.warehouse.fetch_detail,
        params: { id: item.id },
        setData: undefined,
        cacheType: 'default',
      });
      // console.log(res);
      if (res.success) {
        setDetail(res.data);
      } else {
        toast(n('t_process_failed_noti'), {
          description: n(res.message),
        });
      }
    } catch (err) {
      console.error(err);
      toast(n('t_process_failed_noti'), {
        description: n('t_conn_failed_desc_noti'),
      });
    }
  }

  async function handleSubmit(values: FormSchemaType) {
    try {
      const formData = new FormData();
      formData.append('id', values.id);
      formData.append('name', values.name);

      const data = await putData({
        url: paths.manager.category.update,
        body: formData,
        t: t,
      });
      if (data.status === 200) {
        toast(t('t_action_noti'), {
          description: t('t_update_desc_noti'),
        });
        setTimeout(() => {
          setOpen(false);
          setIsReset((prev) => !prev);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create category:', error);
      toast(t('t_action_failed_noti'), {
        description: t('t_update_failed_desc_noti'),
      });
    }
  }

  useEffect(() => {
    if (detail) {
      form.reset({
        id: detail.id,
        name: detail.name,
        street: detail.street,
        ward: detail.ward,
        district: detail.district,
        city: detail.city,
        region: detail.region,
        size: detail.size,
        totalStorageArea: detail.totalStorageArea,
        totalSlot: detail.totalSlot,
        status: detail.status,
        storageArea: detail.storageArea,
      });
    }
  }, [detail, form]);

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
          <DrawerDescription>{t('t_warehouse_desc')}</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          ref={scrollContainerRef}
        >
          <Form {...form}>
            <form
              id="form-edit-user"
              className="flex flex-col gap-4"
              onSubmit={() => handleSubmit}
            >
              <div className="flex flex-col gap-3">
                {/* show name */}
                <div className="grid gap-3">
                  <Label htmlFor="name">{t('t_name')}</Label>
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1 ">
                        {' '}
                        <FormControl>
                          <Input {...field} className="" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* show address */}
                <div className="grid grid-cols-1 grid-rows-2 gap-3">
                  {/* street */}
                  <div className="grid gap-3">
                    <Label htmlFor="name">{t('t_street')}</Label>
                    <FormField
                      name="street"
                      render={({ field }) => (
                        <FormItem className="flex-1 ">
                          {' '}
                          <FormControl>
                            <Input {...field} className="" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* ward + district ity */}
                  <div className="grid grid-cols-3 grid-rows-1"></div>
                </div>
              </div>
            </form>
          </Form>
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
